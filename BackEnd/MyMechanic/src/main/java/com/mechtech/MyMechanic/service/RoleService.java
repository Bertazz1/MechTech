package com.mechtech.MyMechanic.service;

import com.mechtech.MyMechanic.entity.Role;
import com.mechtech.MyMechanic.multiTenants.TenantContext;
import com.mechtech.MyMechanic.repository.RoleRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RoleService extends AbstractTenantAwareService<Role, Long, RoleRepository> {

    public RoleService(RoleRepository repository) {
        super(repository);
    }

    @Transactional
    public Role createRole(Role role) {
        role.setTenantId(TenantContext.getTenantId());
        return repository.save(role);
    }

    @Transactional
    public Role updateRole(Long id, Role roleDetails) {
        Role existingRole = findById(id);
        existingRole.setName(roleDetails.getName());
        existingRole.setReceivesCommission(roleDetails.isReceivesCommission());
        return repository.save(existingRole);
    }

    @Transactional
    public void deleteRole(Long id) {
        Role roleToDelete = findById(id);
        repository.delete(roleToDelete);
    }

    @Transactional
    public Page<Role> findAll(Pageable pageable) {
        return repository.findAll(pageable);
    }


}
