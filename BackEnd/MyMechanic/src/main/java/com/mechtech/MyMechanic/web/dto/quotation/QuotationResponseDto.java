package com.mechtech.MyMechanic.web.dto.quotation;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
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
public class QuotationResponseDto {

    private Long id;
    private String description;
    private String status;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime entryTime;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime exitTime;

    @JsonProperty("total_parts_price")
    private BigDecimal totalPartsCost;

    @JsonProperty("total_services_price")
    private BigDecimal totalServicesCost;

    @JsonProperty("grand_total")
    private BigDecimal totalCost;

    private VehicleResponseDto vehicle;
    private ClientResponseDto client;
    private Set<QuotationPartItemResponseDto> partItems;
    private Set<QuotationServiceItemResponseDto> serviceItems;
}