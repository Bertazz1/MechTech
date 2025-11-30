package com.mechtech.MyMechanic.web.dto.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class UserUpdateDto {

    @Size(max = 100, message = "Nome completo nao pode exceder 100 caracteres")
    @NotBlank(message = "Nome completo nao pode estar em branco")
    private String fullname;

    @NotBlank(message = "Senha nao pode estar em branco")
    @Size(min = 6, message = "Senha deve ter no minimo 6 caracteres")
    private String password;


    @Email(message = "Formato de email invalido")
    @NotBlank(message = "Email nao pode estar em branco")
    private String email;

    @Size(max = 20, message = "Telefone nao pode exceder 20 caracteres")
    private String phone;


    private String cep;
}

