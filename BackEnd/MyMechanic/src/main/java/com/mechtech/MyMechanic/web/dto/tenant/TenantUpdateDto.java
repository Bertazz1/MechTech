package com.mechtech.MyMechanic.web.dto.tenant;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TenantUpdateDto {
    private String companyName;

    private String companyDocument;

    private String companyPhone;

    private boolean active;
}