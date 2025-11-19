package com.mechtech.MyMechanic.service;

import com.mechtech.MyMechanic.entity.RepairService;
import com.mechtech.MyMechanic.multiTenants.TenantContext;
import com.mechtech.MyMechanic.repository.RepairServiceRepository;
import com.mechtech.MyMechanic.repository.projection.RepairServiceProjection;
import com.mechtech.MyMechanic.repository.specification.RepairServiceSpecification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RepairServiceService extends AbstractTenantAwareService<RepairService, Long, RepairServiceRepository> {

    public RepairServiceService(RepairServiceRepository repository) {
        super(repository);
    }

    @Transactional
    public RepairService create(RepairService repairService) {
        repairService.setTenantId(TenantContext.getTenantId());
        return repository.save(repairService);
    }

    @Transactional(readOnly = true)
    public Page<RepairServiceProjection> findAll(Pageable pageable) {
        return repository.findAllProjectedBy(pageable);
    }

    @Transactional(readOnly = true)
    public Page<RepairService> search(String searchTerm, Pageable pageable) {
        return repository.findAll(RepairServiceSpecification.search(searchTerm), pageable);
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

    @Transactional(readOnly = true)
    public Page<RepairServiceProjection> findByName(String name,Pageable pageable) {
        return repository.findByNameContainingIgnoreCase(name, pageable);
    }
}