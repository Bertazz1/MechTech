package com.mechtech.MyMechanic.repository;


import com.mechtech.MyMechanic.entity.Client;
import com.mechtech.MyMechanic.repository.projection.ClientProjection;
import jakarta.validation.constraints.Pattern;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;


public interface ClientRepository extends JpaRepository<Client, Long>, JpaSpecificationExecutor<Client> {

    Page<ClientProjection> findAllProjectedBy(Pageable pageable);

    Optional<Client> findByEmail(String email);


    Optional<Client> findByVehicles_Id(Long vehicleId);

    Page<ClientProjection> findByNameContainingIgnoreCase(String name, Pageable pageable);

    Optional<Client> findByCpf(@Pattern(regexp = "^\\d{11}$", message = "CPF deve conter 11 dígitos.") String cpf);

    Optional<Client> findByPhone(@Pattern(regexp = "^\\d{10,11}$", message = "O telefone deve conter 10 ou 11 dígitos, incluindo o DDD.") String phone);
}
