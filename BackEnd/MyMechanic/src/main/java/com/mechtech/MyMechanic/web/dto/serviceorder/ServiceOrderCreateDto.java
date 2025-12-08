package com.mechtech.MyMechanic.web.dto.serviceorder;

import com.mechtech.MyMechanic.entity.RepairService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Getter
@Setter
public class ServiceOrderCreateDto {

    @NotNull(message = "O ID do veículo não pode ser nulo")
    private Long vehicleId;

    @Size(max = 500, message = "A descrição não pode exceder 500 caracteres")
    private String description;

    private LocalDateTime entryDate;

    @Valid
    private List<ServiceOrderPartDto> partItems;

    @Valid
    private List<ServiceOrderServiceDto> serviceItems;



    private Integer initialMileage;

}