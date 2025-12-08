package com.mechtech.MyMechanic.web.dto.serviceorder;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;


import java.util.Set;

@Getter
@Setter
public class ServiceOrderUpdateDto {


    private String status;

    private Integer initialMileage;



    @Valid
    private Set<ServiceOrderPartDto> partItems;

    @Valid
    private Set<ServiceOrderServiceDto> serviceItems;

    @Size(max = 500, message = "A descrição não pode exceder 500 caracteres")
    private String description;
}