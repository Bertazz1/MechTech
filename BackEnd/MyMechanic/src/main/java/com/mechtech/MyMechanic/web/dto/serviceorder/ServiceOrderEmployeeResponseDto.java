package com.mechtech.MyMechanic.web.dto.serviceorder;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
public class ServiceOrderEmployeeResponseDto {
    private Long id;
    private Long employeeId;
    private String name;
    private BigDecimal commissionPercentage;
    private String roleName;
}