package com.mechtech.MyMechanic.repository.projection;

import com.fasterxml.jackson.annotation.JsonFormat;
import org.springframework.beans.factory.annotation.Value;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public interface QuotationProjection {
    Long getId();

    String getDescription();

    String getStatus();

    @Value("#{target.client.name}")
    String getClientName();

    @Value("#{target.vehicle.licensePlate}")
    String getVehicleLicensePlate();

    BigDecimal getTotalCost();

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    LocalDateTime getEntryTime();

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    LocalDateTime getExitTime();
}
