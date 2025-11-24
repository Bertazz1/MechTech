package com.mechtech.MyMechanic.repository;

import com.mechtech.MyMechanic.entity.Part;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;


public interface PartRepository extends JpaRepository<Part, Long>, JpaSpecificationExecutor<Part> {

    Optional<Part> findByCode(String Code);

}
