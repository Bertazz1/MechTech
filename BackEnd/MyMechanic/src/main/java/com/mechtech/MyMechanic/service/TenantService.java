package com.mechtech.MyMechanic.service;

import com.mechtech.MyMechanic.entity.Tenant;
import com.mechtech.MyMechanic.entity.User;
import com.mechtech.MyMechanic.exception.EntityNotFoundException;
import com.mechtech.MyMechanic.exception.UniqueConstraintViolationException;
import com.mechtech.MyMechanic.repository.TenantRepository;
import com.mechtech.MyMechanic.repository.UserRepository;
import com.mechtech.MyMechanic.web.dto.tenant.TenantSignupDto;
import com.mechtech.MyMechanic.web.dto.tenant.TenantUpdateDto; // Importar novo DTO
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TenantService {

    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public Tenant registerTenant(TenantSignupDto dto) {
        if (userRepository.findByEmail(dto.getAdminEmail()).isPresent()) {
            throw new UniqueConstraintViolationException("Este e-mail já está em uso.");
        }

        Tenant tenant = new Tenant();
        tenant.setName(dto.getCompanyName());
        if (tenantRepository.existsByDocument(dto.getCompanyDocument())){
            throw new UniqueConstraintViolationException("Este CNPJ/CPF já está em uso.");}
        tenant.setDocument(dto.getCompanyDocument());
        tenant.setPhone(dto.getCompanyPhone());
        if (tenantRepository.existsByEmail(dto.getCompanyDocument())) {
            throw new UniqueConstraintViolationException("Já existe uma empresa com este e-mail cadastrado.");
        }
        tenant.setEmail(dto.getAdminEmail());
        tenant.setActive(true);

        tenant = tenantRepository.save(tenant);

        User adminUser = new User();
        if (userRepository.findByEmail(dto.getAdminEmail()).isPresent()){
            throw new UniqueConstraintViolationException("Este e-mail já está em uso.");
        }
        adminUser.setEmail(dto.getAdminEmail());
        adminUser.setPassword(passwordEncoder.encode(dto.getAdminPassword()));
        adminUser.setFullName(dto.getAdminName());
        adminUser.setRole(User.Role.ROLE_CLIENT);
        adminUser.setTenantId(String.valueOf(tenant.getId()));

        userRepository.save(adminUser);

        return tenant;
    }


    public Tenant getById(Long id) {
        return tenantRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Empresa não encontrada"));
    }

    @Transactional
    public Tenant updateTenant(Long id, TenantUpdateDto dto) {
        Tenant tenant = getById(id);

        tenant.setName(dto.getCompanyName());
        tenant.setDocument(dto.getCompanyDocument());
        tenant.setPhone(dto.getCompanyPhone());

        return tenantRepository.save(tenant);
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

    public Tenant findByInviteToken(String inviteToken) {
        return tenantRepository.findByInviteToken(inviteToken)
                .orElseThrow(() -> new EntityNotFoundException("Código de convite inválido ou oficina não encontrada"));
    }
}