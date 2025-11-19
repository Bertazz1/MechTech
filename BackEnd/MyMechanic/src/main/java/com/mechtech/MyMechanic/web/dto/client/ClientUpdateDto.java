package com.mechtech.MyMechanic.web.dto.client;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.*;

import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @ToString
public class ClientUpdateDto {

    @Size(max = 100)
    private String name;

    @Email
    @Size(max = 150)
    private String email;

    @Pattern(regexp = "^\\d{10,11}$", message = "O telefone deve conter 10 ou 11 dígitos, incluindo o DDD.")
    private String phone;

    @Valid
    private AddressDto address;

    @Pattern(regexp = "^\\d{11}$", message = "CPF deve conter 11 dígitos.")
    private String cpf;
}