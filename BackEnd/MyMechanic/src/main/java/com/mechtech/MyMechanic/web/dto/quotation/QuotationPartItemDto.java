package com.mechtech.MyMechanic.web.dto.quotation;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class QuotationPartItemDto {

    @NotNull(message = "ID do item não pode ser nulo")
    private Long id; // ID da Peça (Part)


    private Integer quantity;

    @NotNull(message = "Preço não pode ser nulo")
    private BigDecimal unitPrice; // Preço unitário do item no momento da cotação
}