package com.mechtech.MyMechanic.web.dto.vehicle.vehiclemodel;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @ToString
public class VehicleModelResponseDto {
    private Long id;
    private String name;
    private String brandName;

}
