package com.mechtech.MyMechanic.web.dto.quotation;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
public class QuotationPartItemResponseDto {
    private Long partId;
    private String partName;
    private String partCode;
    private int quantity;
    private BigDecimal unitPrice; // Preço no momento da OS
}