package com.mechtech.MyMechanic.repository;


import com.mechtech.MyMechanic.entity.Client;
import jakarta.validation.constraints.Pattern;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;


public interface ClientRepository extends JpaRepository<Client, Long>, JpaSpecificationExecutor<Client> {

    Optional<Client> findByEmail(String email);

    Optional<Client> findByVehicles_Id(Long vehicleId);

    Optional<Client> findByCpf(@Pattern(regexp = "^\\d{11}$", message = "CPF deve conter 11 dígitos.") String cpf);

    Optional<Client> findByPhone(@Pattern(regexp = "^\\d{10,11}$", message = "O telefone deve conter 10 ou 11 dígitos, incluindo o DDD.") String phone);
}
