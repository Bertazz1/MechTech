package com.mechtech.MyMechanic.repository.projection;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.mechtech.MyMechanic.entity.Invoice;
import org.springframework.beans.factory.annotation.Value;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public interface InvoiceProjection {
    Long getId();
    String getInvoiceNumber();

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    LocalDateTime getIssueDate();

    BigDecimal getTotalAmount();

    Invoice.PaymentStatus getPaymentStatus();

    @Value("#{target.serviceOrder.id}")
    Long getServiceOrderId();

    @Value("#{target.serviceOrder.client.name}")
    String getClientName();

    @Value("#{target.serviceOrder.vehicle.licensePlate}")
    String getLicensePlate();

    @Value("#{target.serviceOrder.vehicle.model.name}")
    String getVehicleModel();
}
