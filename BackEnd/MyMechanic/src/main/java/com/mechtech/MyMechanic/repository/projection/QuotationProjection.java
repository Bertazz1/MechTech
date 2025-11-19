package com.mechtech.MyMechanic.repository.projection;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public interface QuotationProjection {
    Long getId();

    String getDescription();

    String getStatus();

    Long getClientId();

    Long getVehicleId();

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    LocalDateTime getEntryTime();

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    LocalDateTime getExitTime();



}
