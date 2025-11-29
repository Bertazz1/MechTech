package com.mechtech.MyMechanic.web.dto.vehicle;

import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @ToString
public class VehicleCreateDto {

    @Min(1900)
    @Max(2100)
    private int year;

    @NotBlank
    @Pattern(regexp = "^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$", message = "Formato de matrícula inválido. Use o padrão Mercosul (ABC1D23) ou o antigo (ABC1234).")
    private String licensePlate;

    @NotNull
    private Long modelId;

    @NotBlank
    @Size(max = 20)
    private String color;

    @NotNull
    private Long clientId;
}
