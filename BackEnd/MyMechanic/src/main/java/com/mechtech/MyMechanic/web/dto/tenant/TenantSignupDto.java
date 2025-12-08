package com.mechtech.MyMechanic.web.dto.tenant;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TenantSignupDto {
    @NotBlank(message = "O nome da empresa é obrigatório")
    private String companyName;

    @NotBlank(message = "O documento (CNPJ) é obrigatório")
    private String companyDocument;

    private String companyPhone;

    // Dados do Usuário Admin
    @NotBlank(message = "O nome do administrador é obrigatório")
    private String adminName;

    @NotBlank(message = "O e-mail é obrigatório")
    @Email(message = "E-mail inválido")
    private String adminEmail;

    @NotBlank(message = "A senha é obrigatória")
    @Size(min = 6, message = "A senha deve ter no mínimo 6 caracteres")
    private String adminPassword;
}
