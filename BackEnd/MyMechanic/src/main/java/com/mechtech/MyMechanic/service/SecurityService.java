package com.mechtech.MyMechanic.service;

import com.mechtech.MyMechanic.entity.Tenant;
import com.mechtech.MyMechanic.entity.User;
import com.mechtech.MyMechanic.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service("securityService")
@RequiredArgsConstructor
public class SecurityService {

    private final TenantRepository tenantRepository;

    public boolean isTenantMember(Long tenantId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof User) {
            String userTenantId = ((User) principal).getTenantId();
            return userTenantId.equals(String.valueOf(tenantId));
        }


        return false;
    }
}
