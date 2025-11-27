package com.mechtech.MyMechanic.web.dto.employee;

import com.mechtech.MyMechanic.entity.Employee;
import com.mechtech.MyMechanic.entity.Role;
import com.mechtech.MyMechanic.web.dto.client.AddressDto;
import com.mechtech.MyMechanic.web.dto.role.RoleCreateDto;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@RequiredArgsConstructor
public class EmployeeCreateDto {

    @NotBlank(message = "Nome deve ser preenchido")
    @Size(max = 100)
    private String name;

    @Valid
   private RoleCreateDto role;

    @NotBlank(message = "Email deve ser preenchido")
    @Email
    private String email;


    @NotBlank(message = "Telefone deve ser preenchido")
    @Pattern(regexp = "^\\d{10,11}$", message = "O telefone deve conter 10 ou 11 dígitos, incluindo o DDD.")
    private String phone;

    @Valid
    private AddressDto address;

    @NotBlank(message = "CPF deve ser preenchido")
    @Pattern(regexp = "^\\d{11}$", message = "CPF deve conter 11 dígitos.")
    private String cpf;

}
