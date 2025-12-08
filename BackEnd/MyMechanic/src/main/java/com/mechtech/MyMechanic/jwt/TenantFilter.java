package com.mechtech.MyMechanic.jwt;

import com.mechtech.MyMechanic.multiTenants.TenantContext;
import com.mechtech.MyMechanic.service.TenantService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class TenantFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private TenantService tenantService;


    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        final String token = request.getHeader(jwtUtils.JWT_AUTHORIZATION);
        if (token == null || !token.startsWith(jwtUtils.JWT_BEARER)) {
            filterChain.doFilter(request, response);
            return;
        }
        if (!jwtUtils.isTokenValid(token)) {
            logger.warn("JWT Token é inválido");
            filterChain.doFilter(request, response);
            return;
        }
        String tenantId = jwtUtils.getTenantFromToken(token);

        if (tenantId != null && !tenantId.isEmpty()) {
            TenantContext.setTenant(tenantService.getById(Long.parseLong(tenantId)));
        }

        try {
            filterChain.doFilter(request, response);
        } finally {
            TenantContext.clear();
        }
    }
}
