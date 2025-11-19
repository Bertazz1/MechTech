package com.mechtech.MyMechanic.repository;


import com.mechtech.MyMechanic.entity.Employee;
import com.mechtech.MyMechanic.repository.projection.EmployeeProjection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Long>, JpaSpecificationExecutor<Employee> {

    Page<EmployeeProjection> findAllProjectedBy(Pageable pageable);

    Page<EmployeeProjection> findByNameContainingIgnoreCase(String name, Pageable pageable);

    Optional<Employee> findByCpf(String cpf);

    Optional<Employee> findByEmail(String email);


}

