package com.mechtech.MyMechanic.service;

import com.mechtech.MyMechanic.entity.Tenant;
import com.mechtech.MyMechanic.entity.User;
import com.mechtech.MyMechanic.jwt.JwtUserDetails;
import com.mechtech.MyMechanic.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service("securityService")
@RequiredArgsConstructor
public class SecurityService {

    private final TenantRepository tenantRepository;
    private final UserService userService;



    public boolean isTenantMember(Long tenantId) {
        JwtUserDetails userDetails = (JwtUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User authenticatedUser = userService.findByEmail(userDetails.getUsername());
        if (authenticatedUser == null || authenticatedUser.getTenant() == null) {
            return false;
        }
        return authenticatedUser.getTenant().getId().equals(tenantId);
        }

    }

