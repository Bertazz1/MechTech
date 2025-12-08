package com.mechtech.MyMechanic.web.dto.report;

import lombok.Getter;
import lombok.Setter;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

@Getter
@Setter
public class ServiceOrderFilter {
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate startDate;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate endDate;

    private Long employeeId; // Filtra OS que tenha este funcionário em algum serviço
    private Long clientId;
    private Long vehicleId;
    private String status;   // PENDENTE, EM_PROGRESSO, COMPLETO, CANCELADO
}