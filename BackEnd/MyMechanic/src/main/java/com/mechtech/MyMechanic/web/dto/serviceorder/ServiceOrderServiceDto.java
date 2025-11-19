package com.mechtech.MyMechanic.web.dto.serviceorder;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
    @Setter
    public class ServiceOrderServiceDto {
        @NotNull
        private Long id; // ID do RepairService

        @Positive(message = "A quantidade deve ser um número positivo")
        private int quantity = 1; // A quantidade é 1 por defeito (para serviços)

        @Positive(message = "O custo deve ser um número positivo")
        private BigDecimal cost;
    }

