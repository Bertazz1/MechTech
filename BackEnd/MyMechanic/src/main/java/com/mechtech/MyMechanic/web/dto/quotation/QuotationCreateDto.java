package com.mechtech.MyMechanic.web.dto.quotation;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Getter
@Setter
public class QuotationCreateDto {


    @Size(max = 300)
    private String description;

    @NotNull(message = "Data de entrada não pode ser nula")
    private LocalDateTime entryTime;

    @NotNull(message = "ID do veículo não pode ser nulo")
    private Long vehicleId;

    @Valid
    private Set<QuotationPartItemDto> partItems;

    @Valid
    private Set<QuotationServiceItemDto> serviceItems;
}