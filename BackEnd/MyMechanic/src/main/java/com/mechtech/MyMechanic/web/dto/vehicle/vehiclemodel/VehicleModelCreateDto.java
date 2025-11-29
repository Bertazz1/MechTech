package com.mechtech.MyMechanic.web.dto.vehicle.vehiclemodel;


import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @ToString
public class VehicleModelCreateDto {

    private String name;
    private Long brandId;

}
