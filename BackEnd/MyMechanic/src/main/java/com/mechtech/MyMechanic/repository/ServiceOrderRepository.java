package com.mechtech.MyMechanic.repository;

import com.mechtech.MyMechanic.entity.ServiceOrder;
import com.mechtech.MyMechanic.repository.projection.ServiceOrderProjection; // Importar
import org.springframework.data.domain.Page; // Importar
import org.springframework.data.domain.Pageable; // Importar
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ServiceOrderRepository extends JpaRepository<ServiceOrder, Long>, JpaSpecificationExecutor<ServiceOrder> {

    @Query("SELECT so FROM ServiceOrder so " +
            "LEFT JOIN FETCH so.partItems pi " +
            "LEFT JOIN FETCH pi.part " +
            "LEFT JOIN FETCH so.serviceItems si " +
            "LEFT JOIN FETCH si.repairService " +
            "LEFT JOIN FETCH so.employees ei " +
            "LEFT JOIN FETCH ei.employee " +
            "WHERE so.id = :id")
    Optional<ServiceOrder> findByIdWithItems(@Param("id") Long id);

    @Query("SELECT so.id as id, so.status as status, so.entryDate as entryDate, " +
            "so.totalCost as totalCost, v.id as vehicleId, v.licensePlate as vehicleLicensePlate, " +
            "c.id as clientId, c.name as clientName " +
            "FROM ServiceOrder so JOIN so.vehicle v JOIN so.client c")
    Page<ServiceOrderProjection> findAllProjectedBy(Pageable pageable);
}