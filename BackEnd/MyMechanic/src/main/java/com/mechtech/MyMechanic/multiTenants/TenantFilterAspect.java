package com.mechtech.MyMechanic.multiTenants;

import com.mechtech.MyMechanic.entity.Tenant;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.hibernate.Filter;
import org.hibernate.Session;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class TenantFilterAspect {

    @PersistenceContext
    private EntityManager entityManager;

    @Before("execution(* com.mechtech.MyMechanic.service..*.*(..))")
    public void activateTenantFilter() {
        Session session = entityManager.unwrap(Session.class);
        session.disableFilter("tenantFilter"); // Desabilita para evitar acúmulo
        session.disableFilter("deletedFilter");

        Tenant tenant = TenantContext.getTenant();
        Long tenantId = (tenant != null) ? tenant.getId() : null;

        if (tenantId != null) {
            Filter filter = session.enableFilter("tenantFilter");
            filter.setParameter("tenantId", tenantId);
        }

        session.enableFilter("deletedFilter");
    }
}
