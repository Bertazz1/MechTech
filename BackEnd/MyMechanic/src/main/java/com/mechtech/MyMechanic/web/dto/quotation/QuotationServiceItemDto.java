package com.mechtech.MyMechanic.web.dto.quotation;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class QuotationServiceItemDto {

    @NotNull
    private Long  id;


    @Positive(message = "O preço deve ser um número positivo")
    private BigDecimal unitCost; // Preço da peça no momento do serviço
}
