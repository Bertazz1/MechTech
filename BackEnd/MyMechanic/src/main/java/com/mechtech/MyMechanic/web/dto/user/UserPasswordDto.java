package com.mechtech.MyMechanic.web.dto.user;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class UserPasswordDto {

    @NotBlank(message = "Senha antiga não pode estar em branco")
    @Size(min = 6, message = "Senha antiga deve ter no mínimo 6 caracteres")
    private String oldPassword;

    @NotBlank(message = "Nova senha não pode estar em branco")
    @Size(min = 6, message = "Nova senha deve ter no mínimo 6 caracteres")
    private String newPassword;

    @NotBlank(message = "Confirmacao da nova senha não pode estar em branco")
    @Size(min = 6,  message = "Confirmacao da nova senha deve ter no mínimo 6 caracteres")
    private String confirmNewPassword;
}
