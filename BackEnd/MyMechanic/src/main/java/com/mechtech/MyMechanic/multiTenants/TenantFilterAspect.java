package com.mechtech.MyMechanic.multiTenants;

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
        String tenantId = TenantContext.getTenantId();

        if (tenantId != null) {
            Filter filter = session.enableFilter("tenantFilter");
            filter.setParameter("tenantId", tenantId);
        }

            session.enableFilter("deletedFilter");
    }
}