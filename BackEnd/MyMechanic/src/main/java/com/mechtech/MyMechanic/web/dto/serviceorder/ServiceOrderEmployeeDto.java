package com.mechtech.MyMechanic.web.dto.serviceorder;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class ServiceOrderEmployeeDto {

    @NotNull(message = "O ID do funcionário não pode ser nulo")
    private Long Id;

    @DecimalMin(value = "0.0", message = "A comissão não pode ser negativa")
    private int commissionPercentage;

    @DecimalMin(value = "0.0", message = "As horas trabalhadas não podem ser negativas")
    private BigDecimal workedHours;
}