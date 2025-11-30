package com.mechtech.MyMechanic.web.dto.tenant;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TenantResponseDto {
    private Long id;
    private String name;
    private String document;
    private String email;
    private String phone;
    private Boolean active;
    private Boolean hasLogo;
    private String inviteToken;
}