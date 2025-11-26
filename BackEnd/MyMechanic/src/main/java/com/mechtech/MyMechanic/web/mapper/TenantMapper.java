package com.mechtech.MyMechanic.web.mapper;

import com.mechtech.MyMechanic.entity.Tenant;
import com.mechtech.MyMechanic.web.dto.tenant.TenantResponseDto;
import org.springframework.stereotype.Component;

@Component
public class TenantMapper {

    public TenantResponseDto toDto(Tenant tenant) {
        if (tenant == null) {
            return null;
        }

        TenantResponseDto dto = new TenantResponseDto();

        dto.setId(tenant.getId());
        dto.setName(tenant.getName());
        dto.setDocument(tenant.getDocument());
        dto.setEmail(tenant.getEmail());
        dto.setPhone(tenant.getPhone());
        dto.setActive(tenant.getActive());

        boolean hasLogo = tenant.getLogo() != null && tenant.getLogo().length > 0;
        dto.setHasLogo(hasLogo);

        return dto;
    }
}