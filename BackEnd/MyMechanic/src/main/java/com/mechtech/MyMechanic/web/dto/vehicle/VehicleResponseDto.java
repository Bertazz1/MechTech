package com.mechtech.MyMechanic.web.dto.vehicle;

import com.mechtech.MyMechanic.web.dto.client.ClientResponseDto;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @ToString
public class VehicleResponseDto {

    private Long id;
    private int year;
    private String licensePlate;
    private String model;
    private String brand;
    private String color;
    private ClientResponseDto Client;
}
