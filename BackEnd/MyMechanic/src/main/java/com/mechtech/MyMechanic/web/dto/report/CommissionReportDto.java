package com.mechtech.MyMechanic.web.dto.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommissionReportDto {
    private String employeeName;
    private String employeeRole;
    private int completedOrdersCount;
    private BigDecimal totalCommission; // Valor a pagar
}