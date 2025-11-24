package com.mechtech.MyMechanic.repository;

import com.mechtech.MyMechanic.entity.Vehicle;
import com.mechtech.MyMechanic.repository.projection.VehicleProjection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface VehicleRepository extends JpaRepository<Vehicle, Long>, JpaSpecificationExecutor<Vehicle> {

    @Query("SELECT v.id as id, v.brand as brand, v.model as model, v.year as year, v.licensePlate as licensePlate, " +
            "c.id as clientId, c.name as clientName, v.color as color " +
            "FROM Vehicle v JOIN v.client c")
    Page<VehicleProjection> findAllProjectedBy(Pageable pageable);

    Page<VehicleProjection> findByClientId(Long clientId,Pageable pageable);

    Optional<Vehicle> findByLicensePlate(String licensePlate);
}
