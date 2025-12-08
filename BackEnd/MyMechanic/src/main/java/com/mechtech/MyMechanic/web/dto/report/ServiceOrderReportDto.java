package com.mechtech.MyMechanic.web.dto.report;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class ServiceOrderReportDto {
    private Long id;
    private String clientName;
    private String vehiclePlate;
    private String vehicleModel;

    @JsonFormat(pattern = "dd/MM/yyyy HH:mm")
    private LocalDateTime entryDate;

    @JsonFormat(pattern = "dd/MM/yyyy HH:mm")
    private LocalDateTime exitDate;

    private String status;

    private BigDecimal partsTotal;
    private BigDecimal servicesTotal;
    private BigDecimal totalAmount;
}