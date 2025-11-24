package com.mechtech.MyMechanic.repository;

import com.mechtech.MyMechanic.entity.RepairService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface RepairServiceRepository extends JpaRepository<RepairService, Long>, JpaSpecificationExecutor<RepairService> {

}
