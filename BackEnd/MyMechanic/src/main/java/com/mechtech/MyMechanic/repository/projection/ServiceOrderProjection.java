package com.mechtech.MyMechanic.repository.projection;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.math.BigDecimal;
import java.time.LocalDateTime;

// Esta projeção é para listagens, mostrando apenas os dados principais.
public interface ServiceOrderProjection {
    Long getId();
    String getStatus();

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    LocalDateTime getEntryDate();

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    LocalDateTime getExitDate();

    BigDecimal getTotalCost();
    Long getVehicleId();
    String getVehicleLicensePlate();
    Long getClientId();
    String getClientName();
}