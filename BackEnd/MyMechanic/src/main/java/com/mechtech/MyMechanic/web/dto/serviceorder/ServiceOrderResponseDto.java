package com.mechtech.MyMechanic.web.dto.serviceorder;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.mechtech.MyMechanic.web.dto.client.ClientResponseDto;
import com.mechtech.MyMechanic.web.dto.vehicle.VehicleResponseDto;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Getter
@Setter
public class ServiceOrderResponseDto {
    private Long id;
    private String status;
    private String description;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime entryDate;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime exitDate;

    private BigDecimal totalCost;
    private Long quotationId;
    private VehicleResponseDto vehicle;
    private ClientResponseDto client;
    private List<ServiceOrderEmployeeResponseDto> employees;
    private List<ServiceOrderServiceItemResponseDto> serviceItems;
    private List<ServiceOrderPartItemResponseDto> partItems;
}