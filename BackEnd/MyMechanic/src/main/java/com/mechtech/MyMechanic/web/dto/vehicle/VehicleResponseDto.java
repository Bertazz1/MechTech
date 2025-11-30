package com.mechtech.MyMechanic.web.dto.vehicle;

import com.mechtech.MyMechanic.web.dto.client.ClientResponseDto;
import com.mechtech.MyMechanic.web.dto.vehicle.vehiclebrand.VehicleBrandResponseDto;
import com.mechtech.MyMechanic.web.dto.vehicle.vehiclemodel.VehicleModelResponseDto;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @ToString
public class VehicleResponseDto {

    private Long id;
    private int year;
    private String licensePlate;
    private VehicleModelResponseDto model;
    private String color;
    private ClientResponseDto client;
}
