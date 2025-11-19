package com.mechtech.MyMechanic.repository;

import com.mechtech.MyMechanic.entity.Part;
import com.mechtech.MyMechanic.repository.projection.PartProjection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.Optional;


public interface PartRepository extends JpaRepository<Part, Long>, JpaSpecificationExecutor<Part> {


    Page<PartProjection> findAllProjectedBy(Pageable pageable);

    Optional<Part> findByCode(String Code);

    Page<PartProjection> findByNameContainingIgnoreCase(String name, Pageable pageable);

    Page<PartProjection> findBySupplierContainingIgnoreCase(String supplier, Pageable pageable);


}
