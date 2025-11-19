package com.mechtech.MyMechanic.web.dto.repairservice;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class RepairServiceResponseDto {

    private Long id;
    private String name;
    private String description;
    private BigDecimal cost;
}