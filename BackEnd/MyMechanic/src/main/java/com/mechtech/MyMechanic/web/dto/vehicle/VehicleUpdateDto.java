package com.mechtech.MyMechanic.web.dto.vehicle;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @ToString
public class VehicleUpdateDto {

    @Min(1900)
    @Max(2100)
    private int year;

    @Size(min = 7, max = 8)
    @Pattern(regexp = "^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$", message = "Formato de matrícula inválido. Use o padrão Mercosul (ABC1D23) ou o antigo (ABC1234).")
    private String licensePlate;

    @Positive
    private Long brandId;

    @Positive
    private Long modelId;

    @Size(max = 20)
    private String color;

    @Positive
    private Long clientId;
}
