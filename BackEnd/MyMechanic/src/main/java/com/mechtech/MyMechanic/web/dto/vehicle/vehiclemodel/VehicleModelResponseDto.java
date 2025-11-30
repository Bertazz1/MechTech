package com.mechtech.MyMechanic.web.dto.vehicle.vehiclemodel;

import com.mechtech.MyMechanic.web.dto.vehicle.vehiclebrand.VehicleBrandResponseDto;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @ToString
public class VehicleModelResponseDto {
    private Long id;
    private String name;
    private VehicleBrandResponseDto brand;

}
