package com.mechtech.MyMechanic.repository;

import com.mechtech.MyMechanic.entity.Part;
import com.mechtech.MyMechanic.entity.RepairService;
import com.mechtech.MyMechanic.repository.projection.RepairServiceProjection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

public interface RepairServiceRepository extends JpaRepository<RepairService, Long>, JpaSpecificationExecutor<RepairService> {

    Page<RepairServiceProjection> findAllProjectedBy(Pageable pageable);

    Page<RepairServiceProjection> findByNameContainingIgnoreCase(String name, Pageable pageable);

}

