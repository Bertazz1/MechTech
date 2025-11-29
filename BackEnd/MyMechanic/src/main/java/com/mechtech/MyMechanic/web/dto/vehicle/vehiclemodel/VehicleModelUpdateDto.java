package com.mechtech.MyMechanic.web.dto.vehicle.vehiclemodel;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @ToString
public class VehicleModelUpdateDto {

    private String name;
    private Long brandId;

}
