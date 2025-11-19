package com.mechtech.MyMechanic.repository;

import com.mechtech.MyMechanic.entity.Quotation;
import com.mechtech.MyMechanic.repository.projection.QuotationProjection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;


public interface QuotationRepository  extends JpaRepository<Quotation, Long>, JpaSpecificationExecutor<Quotation> {

    Page<QuotationProjection> findAllProjectedBy(Pageable pageable);

     Optional<List<Quotation>> findByVehicleId(Long vehicleId);

    @Query("SELECT q FROM Quotation q " +
            "LEFT JOIN FETCH q.partItems pi " +
            "LEFT JOIN FETCH pi.part " +
            "LEFT JOIN FETCH q.serviceItems si " +
            "LEFT JOIN FETCH si.repairService " +
            "WHERE q.id = :id")
    Optional<Quotation> findByIdWithItems(Long id);
}
