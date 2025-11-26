package com.mechtech.MyMechanic.service;

import com.mechtech.MyMechanic.entity.Tenant;
import com.mechtech.MyMechanic.entity.User;
import com.mechtech.MyMechanic.repository.TenantRepository;
import com.mechtech.MyMechanic.repository.UserRepository;
import com.mechtech.MyMechanic.web.dto.tenant.TenantSignupDto;
import com.mechtech.MyMechanic.exception.UniqueConstraintViolationException;
import com.mechtech.MyMechanic.exception.EntityNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
public class TenantService {

    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public TenantService(TenantRepository tenantRepository, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.tenantRepository = tenantRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

        @Transactional
        public Tenant registerTenant(TenantSignupDto dto) {
            if (userRepository.findByEmail(dto.getAdminEmail()).isPresent()) {
                throw new UniqueConstraintViolationException("Este e-mail já está em uso.");
            }

            //  Cria a Empresa
            Tenant tenant = new Tenant();
            tenant.setName(dto.getCompanyName());
            tenant.setDocument(dto.getCompanyDocument());
            tenant.setPhone(dto.getCompanyPhone());
            tenant.setEmail(dto.getAdminEmail());
            tenant = tenantRepository.save(tenant);

            //  Cria o Usuário Admin vinculado à Empresa
            User adminUser = new User();
            adminUser.setFullName(dto.getAdminName());
            adminUser.setPassword(passwordEncoder.encode(dto.getAdminPassword()));
            adminUser.setEmail(dto.getAdminEmail());
            adminUser.setRole(User.Role.ROLE_ADMIN);
            // O seu sistema usa tenantId como String na entidade User, então convertemos o ID gerado
            adminUser.setTenantId(String.valueOf(tenant.getId()));

            userRepository.save(adminUser);

            return tenant;
        }

    public Tenant getById(Long id) {
        return tenantRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Empresa não encontrada"));
    }


    @Transactional
    public void updateLogo(Long tenantId, MultipartFile file) {
        Tenant tenant = getById(tenantId);
        try {
            tenant.setLogo(file.getBytes());
            tenant.setLogoContentType(file.getContentType());
            tenantRepository.save(tenant);
        } catch (IOException e) {
            throw new RuntimeException("Erro ao processar imagem", e);
        }
    }

    @Transactional(readOnly = true)
    public byte[] getLogo(Long tenantId) {
        Tenant tenant = getById(tenantId);
        return tenant.getLogo();
    }

    @Transactional(readOnly = true)
    public String getLogoContentType(Long tenantId) {
        Tenant tenant = getById(tenantId);
        return tenant.getLogoContentType();
    }
}