package com.mechtech.MyMechanic.repository;


import com.mechtech.MyMechanic.entity.Client;
import com.mechtech.MyMechanic.repository.projection.ClientProjection;
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
}
