package com.mechtech.MyMechanic.service;

import com.mechtech.MyMechanic.entity.RepairService;
import com.mechtech.MyMechanic.multiTenants.TenantContext;
import com.mechtech.MyMechanic.repository.RepairServiceRepository;
import com.mechtech.MyMechanic.repository.projection.RepairServiceProjection;
import com.mechtech.MyMechanic.repository.specification.RepairServiceSpecification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.projection.ProjectionFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RepairServiceService extends AbstractTenantAwareService<RepairService, Long, RepairServiceRepository> {

    private final ProjectionFactory projectionFactory;

    public RepairServiceService(RepairServiceRepository repository, ProjectionFactory projectionFactory) {
        super(repository);
        this.projectionFactory = projectionFactory;
    }

    @Transactional
    public RepairService create(RepairService repairService) {
        repairService.setTenant(TenantContext.getTenant());
        return repository.save(repairService);
    }

    @Transactional(readOnly = true)
    public Page<RepairServiceProjection> findAll(Pageable pageable) {
        Page<RepairService> repairServicesPage = repository.findAll(pageable);
        return repairServicesPage.map(repairService -> projectionFactory.createProjection(RepairServiceProjection.class, repairService));
    }

    @Transactional(readOnly = true)
    public Page<RepairServiceProjection> search(String searchTerm, Pageable pageable) {
        Specification<RepairService> spec = RepairServiceSpecification.search(searchTerm);
        Page<RepairService> repairServicesPage = repository.findAll(spec, pageable);
        return repairServicesPage.map(repairService -> projectionFactory.createProjection(RepairServiceProjection.class, repairService));
    }

    @Transactional
    public RepairService update(Long id, RepairService repairServiceDetails) {
        // Garante que o serviço que estamos a tentar atualizar existe e pertence ao tenant
        findById(id);
        return repository.save(repairServiceDetails);
    }

    @Transactional
    public void delete(Long id) {
        RepairService serviceToDelete = findById(id); // Validação de tenant inclusa
        repository.delete(serviceToDelete);
    }
}
