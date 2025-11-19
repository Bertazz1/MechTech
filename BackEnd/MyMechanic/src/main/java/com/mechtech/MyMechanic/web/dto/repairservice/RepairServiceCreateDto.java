package com.mechtech.MyMechanic.web.dto.repairservice;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class RepairServiceCreateDto {

    @NotBlank(message = "O nome não pode estar em branco")
    @Size(max = 100, message = "O nome não pode exceder 100 caracteres")
    private String name;

    @Size(max = 500, message = "A descrição não pode exceder 500 caracteres")
    private String description;

    @NotNull(message = "O custo não pode ser nulo")
    @DecimalMin(value = "0.01", message = "O custo deve ser maior que zero")
    private BigDecimal cost;
}