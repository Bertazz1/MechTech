package com.mechtech.MyMechanic.web.dto.serviceorder;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
public class ServiceOrderServiceItemResponseDto {
    private Long serviceId;
    private String serviceName;
    private BigDecimal serviceCost; // Custo no momento da OS
}