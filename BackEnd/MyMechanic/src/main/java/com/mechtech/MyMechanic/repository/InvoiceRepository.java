package com.mechtech.MyMechanic.repository;

import com.mechtech.MyMechanic.entity.Employee;
import com.mechtech.MyMechanic.entity.Invoice;
import com.mechtech.MyMechanic.repository.projection.InvoiceProjection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long>, JpaSpecificationExecutor<Invoice> {

    boolean existsByServiceOrderId(Long serviceOrderId);

    Page<InvoiceProjection> findAllProjectedBy(Pageable pageable);

}