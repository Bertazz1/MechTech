package com.mechtech.MyMechanic.repository;

import com.mechtech.MyMechanic.entity.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TenantRepository extends JpaRepository<Tenant, Long> {
}