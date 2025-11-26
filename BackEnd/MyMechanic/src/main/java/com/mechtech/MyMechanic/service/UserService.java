package com.mechtech.MyMechanic.service;

import com.mechtech.MyMechanic.entity.Tenant;
import com.mechtech.MyMechanic.entity.User;
import com.mechtech.MyMechanic.exception.BusinessRuleException;
import com.mechtech.MyMechanic.exception.EntityNotFoundException;
import com.mechtech.MyMechanic.exception.PasswordInvalidException;
import com.mechtech.MyMechanic.exception.UniqueConstraintViolationException;
import com.mechtech.MyMechanic.repository.UserRepository;
import com.mechtech.MyMechanic.repository.specification.UserSpecification;
import com.mechtech.MyMechanic.web.dto.user.UserCreateDto;
import com.mechtech.MyMechanic.web.mapper.UserMapper;
import com.mechtech.MyMechanic.web.dto.user.UserUpdateDto;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class UserService extends AbstractTenantAwareService<User, Long, UserRepository> {

    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final EmailService emailService;
    private final UserRepository userRepository;
    private final TenantService tenantService;


    public UserService(UserRepository repository, PasswordEncoder passwordEncoder, UserMapper userMapper, EmailService emailService,
                       UserRepository userRepository, TenantService tenantService) {
        super(repository);
        this.passwordEncoder = passwordEncoder;
        this.userMapper = userMapper;
        this.emailService = emailService;
        this.userRepository = userRepository;
        this.tenantService = tenantService;
    }

    @Transactional
    public User createUser(UserCreateDto dto) {
        Tenant tenant = tenantService.findByInviteToken(dto.getInviteToken());

        if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new UniqueConstraintViolationException("E-mail já cadastrado.");
        }

        User user = new User();
        user.setFullName(dto.getFullname());
        user.setEmail(dto.getEmail());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setPhone(dto.getPhone());
        user.setRole(User.Role.ROLE_CLIENT);

        // Define o Tenant ID encontrado via token
        user.setTenantId(String.valueOf(tenant.getId()));

        user.setStatus(User.Status.ACTIVE); // Garante que nasce ativo

        return userRepository.save(user);
    }

    @Transactional
    public User updatePassword(Long id, String oldPassword, String newPassword, String confirmNewPassword) {
        if (!newPassword.equals(confirmNewPassword)) {
            throw new PasswordInvalidException("Nova senha e confirmação não conferem");
        }

        User user = findById(id); // Validação de tenant acontece aqui
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new PasswordInvalidException("Senha antiga inválida");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        return user;
    }

    @Transactional(readOnly = true)
    public Page<User> findAll(Pageable pageable) {
        return repository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public User findByEmail(String username) {
        // A validação de tenant não se aplica na autenticação inicial, pois ainda não há contexto.
        return repository.findByEmailAndStatus(username, User.Status.ACTIVE).orElseThrow(() ->
                new EntityNotFoundException(String.format("User nao encontrado com username: %s", username)));
    }

    @Transactional(readOnly = true)
    public User.Role findRoleByEmail(String username) {
        return repository.findRoleByEmail(username);
    }

    @Transactional
    public User updateProfile(Long id, UserUpdateDto userUpdateDto) {
        try {
            User user = findById(id); // Validação de tenant acontece aqui
            userMapper.updateFromDTO(userUpdateDto, user);
            return repository.save(user);
        } catch (DataIntegrityViolationException ex) {
            throw new UniqueConstraintViolationException(ex.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public Page<User> search(String searchTerm, Pageable pageable) {
        return repository.findAll(UserSpecification.search(searchTerm), pageable);
    }

    @Transactional
    public void delete(User user) {
        if (user == null || user.getId() == null) {
            throw new EntityNotFoundException("Usuário nao encontrado");
        }
        validateTenant(user);
        repository.delete(user);
    }

    @Transactional
    public User createPasswordResetToken(String fullName) {
        User user = repository.findByFullName(fullName).orElseThrow(() ->
                new EntityNotFoundException("Usuário não encontrado com o username: " + fullName));

        if (user.getStatus() != User.Status.ACTIVE) {
            throw new BusinessRuleException("A conta do usuário está inativa.");
        }

        if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
            throw new BusinessRuleException("O e-mail do usuário não está registrado para recuperação de senha.");
        }

        String token = UUID.randomUUID().toString();
        // Token expira em 30 minutos
        LocalDateTime expiryDate = LocalDateTime.now().plusMinutes(30);

        user.setPasswordResetToken(token);
        user.setPasswordResetTokenExpiresAt(expiryDate);
        repository.save(user);

        emailService.sendPasswordResetEmail(user, token);

        return user;
    }

    @Transactional
    public void resetPassword(String token, String newPassword, String confirmNewPassword) {
        if (!newPassword.equals(confirmNewPassword)) {
            throw new PasswordInvalidException("Nova senha e confirmação não conferem");
        }

        User user = repository.findByPasswordResetToken(token).orElseThrow(() ->
                new EntityNotFoundException("Token de redefinição inválido ou não encontrado."));

        if (user.getPasswordResetTokenExpiresAt().isBefore(LocalDateTime.now())) {
            user.setPasswordResetToken(null);
            user.setPasswordResetTokenExpiresAt(null);
            repository.save(user);
            throw new PasswordInvalidException("Token de redefinição expirado.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));

        // Invalida o token após o uso
        user.setPasswordResetToken(null);
        user.setPasswordResetTokenExpiresAt(null);

        repository.save(user);
    }
}