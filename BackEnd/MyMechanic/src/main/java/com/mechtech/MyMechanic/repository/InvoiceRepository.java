package com.mechtech.MyMechanic.repository;

import com.mechtech.MyMechanic.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long>, JpaSpecificationExecutor<Invoice> {

    boolean existsByServiceOrderId(Long serviceOrderId);
    long countByPaymentStatus(Invoice.PaymentStatus paymentStatus);

}
