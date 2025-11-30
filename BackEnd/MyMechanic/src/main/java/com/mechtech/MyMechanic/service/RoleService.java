package com.mechtech.MyMechanic.service;

import com.mechtech.MyMechanic.entity.Part;
import com.mechtech.MyMechanic.entity.Role;
import com.mechtech.MyMechanic.multiTenants.TenantContext;
import com.mechtech.MyMechanic.repository.RoleRepository;
import com.mechtech.MyMechanic.repository.projection.PartProjection;
import com.mechtech.MyMechanic.repository.projection.RoleProjection;
import com.mechtech.MyMechanic.repository.specification.PartSpecification;
import com.mechtech.MyMechanic.repository.specification.RoleSpecification;
import com.mechtech.MyMechanic.web.dto.pageable.PageableDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.projection.ProjectionFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RoleService extends AbstractTenantAwareService<Role, Long, RoleRepository> {

    private final ProjectionFactory projectionFactory;

    public RoleService(RoleRepository repository, ProjectionFactory projectionFactory) {

        super(repository);
        this.projectionFactory = projectionFactory;
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
    public Page<RoleProjection> findAll(Pageable pageable) {
        Page<Role> rolesPage = repository.findAll(pageable);
        return rolesPage.map(role -> projectionFactory.createProjection(RoleProjection.class, role));
    }


    @Transactional(readOnly = true)
    public Page<RoleProjection> search(String searchTerm, Pageable pageable) {
        Specification<Role> spec = RoleSpecification.search(searchTerm);
        Page<Role> rolesPage = repository.findAll(spec, pageable);
        return rolesPage.map(part -> projectionFactory.createProjection(RoleProjection.class, part));
    }
}



