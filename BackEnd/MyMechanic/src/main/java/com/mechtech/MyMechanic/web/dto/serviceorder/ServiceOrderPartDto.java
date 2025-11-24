package com.mechtech.MyMechanic.web.dto.serviceorder;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class ServiceOrderPartDto {
    @NotNull
    private Long id; // ID da Peça (Part)

    @Positive(message = "A quantidade deve ser um número positivo")
    private int quantity;

    @Positive(message = "O preço deve ser um número positivo")
    private BigDecimal unitCost; // Preço da peça no momento do serviço
}