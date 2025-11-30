package com.mechtech.MyMechanic.repository;

import com.mechtech.MyMechanic.entity.VehicleBrand;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface VehicleBrandRepository extends JpaRepository<VehicleBrand, Long>, JpaSpecificationExecutor<VehicleBrand> {


    Optional<VehicleBrand> findByName(String name);
}
