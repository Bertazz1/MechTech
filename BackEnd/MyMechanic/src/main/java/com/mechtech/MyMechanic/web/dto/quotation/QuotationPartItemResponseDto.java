package com.mechtech.MyMechanic.web.dto.quotation;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
public class QuotationPartItemResponseDto {
    private Long id; // ID do Item
    private Long partId; // <--- ID da Peça
    private String partName; // <--- Nome da Peça (Resolv "undefined")
    private Integer quantity;
    private BigDecimal unitPrice;
}