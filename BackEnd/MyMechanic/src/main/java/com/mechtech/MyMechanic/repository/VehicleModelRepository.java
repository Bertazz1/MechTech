package com.mechtech.MyMechanic.repository;

import com.mechtech.MyMechanic.entity.VehicleModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface VehicleModelRepository extends JpaRepository<VehicleModel, Long>, JpaSpecificationExecutor<VehicleModel> {


    Optional<VehicleModel> findByName(String name);
}
