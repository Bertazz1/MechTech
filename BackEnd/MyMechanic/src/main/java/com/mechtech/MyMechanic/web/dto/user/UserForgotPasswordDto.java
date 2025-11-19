package com.mechtech.MyMechanic.web.dto.user;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserForgotPasswordDto {

    @NotBlank(message = "Username não pode estar em branco")
    private String username;
}