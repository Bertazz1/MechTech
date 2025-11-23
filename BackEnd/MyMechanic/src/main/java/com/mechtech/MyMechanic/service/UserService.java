package com.mechtech.MyMechanic.service;

import com.mechtech.MyMechanic.entity.User;
import com.mechtech.MyMechanic.exception.BusinessRuleException;
import com.mechtech.MyMechanic.exception.EntityNotFoundException;
import com.mechtech.MyMechanic.exception.PasswordInvalidException;
import com.mechtech.MyMechanic.exception.UniqueConstraintViolationException;
import com.mechtech.MyMechanic.repository.UserRepository;
import com.mechtech.MyMechanic.repository.specification.UserSpecification;
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

    public UserService(UserRepository repository, PasswordEncoder passwordEncoder, UserMapper userMapper, EmailService emailService,
                       UserRepository userRepository) {
        super(repository);
        this.passwordEncoder = passwordEncoder;
        this.userMapper = userMapper;
        this.emailService = emailService;
        this.userRepository = userRepository;
    }

    @Transactional
    public User createUser(User user) {
        try {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
            return repository.save(user);
        } catch (DataIntegrityViolationException ex) {
            throw new UniqueConstraintViolationException("Já existe um registro com esses dados.");
        }
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
    public User findByUsername(String username) {
        // A validação de tenant não se aplica na autenticação inicial, pois ainda não há contexto.
        return repository.findByUsernameAndStatus(username, User.Status.ACTIVE).orElseThrow(() ->
                new EntityNotFoundException(String.format("User nao encontrado com username: %s", username)));
    }

    @Transactional(readOnly = true)
    public User.Role findRoleByUsername(String username) {
        return repository.findRoleByUsername(username);
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
    public User createPasswordResetToken(String username) {
        User user = repository.findByUsername(username).orElseThrow(() ->
                new EntityNotFoundException("Usuário não encontrado com o username: " + username));

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