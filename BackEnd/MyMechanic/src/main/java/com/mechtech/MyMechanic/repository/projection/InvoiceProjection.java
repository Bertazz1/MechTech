package com.mechtech.MyMechanic.repository.projection;

import com.mechtech.MyMechanic.entity.Invoice;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public interface InvoiceProjection {
    Long getId();
    String getInvoiceNumber();
    LocalDateTime getIssueDate();
    BigDecimal getTotalAmount();
    Invoice.PaymentStatus getPaymentStatus();

    Long getServiceOrderId();
    String getServiceOrderClientName();
    String getServiceOrderVehicleLicensePlate();
}