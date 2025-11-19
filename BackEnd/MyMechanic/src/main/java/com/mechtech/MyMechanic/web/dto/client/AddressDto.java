package com.mechtech.MyMechanic.web.dto.client;

import lombok.Getter;
import lombok.Setter;
import jakarta.validation.constraints.Pattern;

@Getter
@Setter
public class AddressDto {
    private String street;
    private String city;
    private String state;

    @Pattern(regexp = "^\\d{8}$", message = "O CEP deve conter 8 dígitos numéricos.")
    private String zipCode;
    private String neighborhood;
    private String number;
    private String complement;
}