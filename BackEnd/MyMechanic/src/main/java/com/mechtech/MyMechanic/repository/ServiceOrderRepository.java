package com.mechtech.MyMechanic.repository;

import com.mechtech.MyMechanic.entity.ServiceOrder;
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

}
