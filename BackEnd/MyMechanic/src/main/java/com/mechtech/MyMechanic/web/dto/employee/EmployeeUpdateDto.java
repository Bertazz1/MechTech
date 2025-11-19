package com.mechtech.MyMechanic.web.dto.employee;


import com.mechtech.MyMechanic.web.dto.client.AddressDto;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @ToString
public class EmployeeUpdateDto {

    @Size(max = 100)
    private String name;

    private String role;

    @Email
    private String email;

    @Pattern(regexp = "^\\d{10,11}$", message = "O telefone deve conter 10 ou 11 dígitos, incluindo o DDD.")
    private String phone;

    @Valid
    private AddressDto address;

    @Pattern(regexp = "^\\d{11}$", message = "CPF deve conter 11 dígitos.")
    private String cpf;

}
