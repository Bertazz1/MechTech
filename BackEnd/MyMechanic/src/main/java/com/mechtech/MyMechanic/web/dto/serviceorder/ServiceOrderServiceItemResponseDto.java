package com.mechtech.MyMechanic.web.dto.serviceorder;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
public class ServiceOrderServiceItemResponseDto {
    private Long id;
    private Long serviceId;
    private String serviceName;
    private int quantity;
    private BigDecimal unitCost; // Custo no momento da OS
}