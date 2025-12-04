package com.mechtech.MyMechanic.repository;

import com.mechtech.MyMechanic.entity.ServiceOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ServiceOrderRepository extends JpaRepository<ServiceOrder, Long>, JpaSpecificationExecutor<ServiceOrder> {

    long countByStatus(ServiceOrder.ServiceOrderStatus status);

    // Soma do totalCost de ordens completas em um período (Faturamento)
    @Query("SELECT COALESCE(SUM(so.totalCost), 0) FROM ServiceOrder so WHERE so.status = 'COMPLETO' AND so.exitDate BETWEEN :start AND :end")
    BigDecimal sumTotalCostByExitDateBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    // Buscar ordens completas no período para cálculo de comissão
    @Query("SELECT DISTINCT so FROM ServiceOrder so " +
            "LEFT JOIN FETCH so.serviceItems " +
            "WHERE so.status = 'COMPLETO' AND so.exitDate BETWEEN :start AND :end")
    List<ServiceOrder> findCompletedOrdersBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT so FROM ServiceOrder so " +
            "LEFT JOIN FETCH so.partItems pi " +
            "LEFT JOIN FETCH pi.part " +
            "LEFT JOIN FETCH so.serviceItems si " +
            "LEFT JOIN FETCH si.repairService " +
            "WHERE so.id = :id")
    Optional<ServiceOrder> findByIdWithItems(@Param("id") Long id);
}