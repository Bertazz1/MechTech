package com.mechtech.MyMechanic.repository;

import com.mechtech.MyMechanic.entity.Tenant;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TenantRepository extends JpaRepository<Tenant, Long> {
    boolean existsByDocument(@NotBlank(message = "O documento (CNPJ) é obrigatório") String companyDocument);

    boolean existsByEmail(@NotBlank(message = "O documento (CNPJ) é obrigatório") String companyDocument);
}