package com.mechtech.MyMechanic.service;

import com.mechtech.MyMechanic.exception.EntityNotFoundException;
import com.mechtech.MyMechanic.multiTenants.TenantContext;
import com.mechtech.MyMechanic.multiTenants.TenantOwned;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.transaction.annotation.Transactional;


public abstract class AbstractTenantAwareService<T extends TenantOwned, ID, R extends JpaRepository<T, ID>> {

    protected final R repository;

    public AbstractTenantAwareService(R repository) {
        this.repository = repository;
    }


    @Transactional(readOnly = true)
    public T findById(ID id) {
        T entity = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        String.format("Recurso com id '%s' não encontrado.", id)
                ));

        validateTenant(entity);

        return entity;
    }

    protected void validateTenant(T entity) {
        String currentTenantId = TenantContext.getTenantId();
        // A validacao so é feita se houver um tenant no contexto
        if (currentTenantId != null && !currentTenantId.equals(entity.getTenantId())) {
            throw new AccessDeniedException("Acesso negado. Este recurso não pertence ao seu tenant.");
        }
    }
}