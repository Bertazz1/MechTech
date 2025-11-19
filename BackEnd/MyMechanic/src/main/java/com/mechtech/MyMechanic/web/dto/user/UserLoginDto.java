package com.mechtech.MyMechanic.web.dto.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class UserLoginDto {


    @NotBlank(message = "Username nao pode estar em branco")
    private String username;

    @NotBlank(message = "Senha nao pode estar em branco")
    @Size(min = 6, message = "Senha deve ter pelo menos 6 caracteres")
    private String password;



}
