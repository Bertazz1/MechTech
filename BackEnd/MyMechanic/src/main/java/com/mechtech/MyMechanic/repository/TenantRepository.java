package com.mechtech.MyMechanic.repository;

import com.mechtech.MyMechanic.entity.Tenant;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TenantRepository extends JpaRepository<Tenant, Long> {
    boolean existsByDocument(@NotBlank(message = "O documento (CNPJ) é obrigatório") String companyDocument);

    boolean existsByEmail(@NotBlank(message = "O documento (CNPJ) é obrigatório") String companyDocument);

    Optional<Tenant> findByInviteToken(String inviteToken);
}