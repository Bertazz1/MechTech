package com.mechtech.MyMechanic.repository.projection;

import com.mechtech.MyMechanic.entity.Invoice;
import org.springframework.beans.factory.annotation.Value;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public interface InvoiceProjection {
    Long getId();
    String getInvoiceNumber();
    LocalDateTime getIssueDate();
    BigDecimal getTotalAmount();
    Invoice.PaymentStatus getPaymentStatus();

    @Value("#{target.serviceOrder.id}")
    Long getServiceOrderId();

    @Value("#{target.serviceOrder.client.name}")
    String getServiceOrderClientName();

    @Value("#{target.serviceOrder.vehicle.licensePlate}")
    String getServiceOrderVehicleLicensePlate();
}
