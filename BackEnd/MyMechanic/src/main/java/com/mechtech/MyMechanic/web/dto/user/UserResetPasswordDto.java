package com.mechtech.MyMechanic.web.dto.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserResetPasswordDto {

    @NotBlank(message = "Token de recuperação não pode estar em branco")
    private String token;

    @NotBlank(message = "Nova senha não pode estar em branco")
    @Size(min = 6, message = "Nova senha deve ter no mínimo 6 caracteres")
    private String newPassword;

    @NotBlank(message = "Confirmação da nova senha não pode estar em branco")
    @Size(min = 6, message = "Confirmação da nova senha deve ter no mínimo 6 caracteres")
    private String confirmNewPassword;
}