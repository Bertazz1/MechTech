package com.mechtech.MyMechanic.web.dto.tenant;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TenantUpdateDto {
    @NotBlank(message = "O nome da empresa é obrigatório")
    private String companyName;

    @NotBlank(message = "O documento (CNPJ) é obrigatório")
    private String companyDocument;

    private String companyPhone;
}