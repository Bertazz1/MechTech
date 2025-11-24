package com.mechtech.MyMechanic.service;

import com.mechtech.MyMechanic.entity.Part;
import com.mechtech.MyMechanic.exception.EntityNotFoundException;
import com.mechtech.MyMechanic.exception.UniqueConstraintViolationException;
import com.mechtech.MyMechanic.multiTenants.TenantContext;
import com.mechtech.MyMechanic.repository.PartRepository;
import com.mechtech.MyMechanic.repository.projection.PartProjection;
import com.mechtech.MyMechanic.repository.specification.PartSpecification;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.projection.ProjectionFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PartService extends AbstractTenantAwareService<Part, Long, PartRepository> {

    private final ProjectionFactory projectionFactory;

    public PartService(PartRepository repository, ProjectionFactory projectionFactory) {
        super(repository);
        this.projectionFactory = projectionFactory;
    }

    @Transactional
    public Part createPart(Part part) {
        try {
            part.setTenantId(TenantContext.getTenantId());
            return repository.save(part);
        } catch (DataIntegrityViolationException ex) {
            throw new UniqueConstraintViolationException("Codigo ja registrado: " + part.getCode());
        }
    }

    @Transactional(readOnly = true)
    public Page<PartProjection> findAll(Pageable pageable) {
        Page<Part> partsPage = repository.findAll(pageable);
        return partsPage.map(part -> projectionFactory.createProjection(PartProjection.class, part));
    }

    @Transactional
    public Part updatePart(Long id, Part partDetails) {
        try {
            // Garante que a peça existe e pertence ao tenant antes de salvar
            findById(id);
            return repository.save(partDetails);
        } catch (DataIntegrityViolationException ex) {
            throw new UniqueConstraintViolationException("Codigo ja registrado: " + partDetails.getCode());
        }
    }

    @Transactional
    public void delete(Part part) {
        if (part == null || part.getId() == null) {
            throw new EntityNotFoundException("Peça não encontrada ou ID inválido.");
        }
        validateTenant(part);
        repository.delete(part);
    }

    @Transactional(readOnly = true)
    public Part findByCode(String code) {
        Part part = repository.findByCode(code)
                .orElseThrow(() -> new EntityNotFoundException("Peça não encontrada: " + code));
        validateTenant(part);
        return part;
    }

    @Transactional(readOnly = true)
    public Page<PartProjection> search(String searchTerm, Pageable pageable) {
        Specification<Part> spec = PartSpecification.search(searchTerm);
        Page<Part> partsPage = repository.findAll(spec, pageable);
        return partsPage.map(part -> projectionFactory.createProjection(PartProjection.class, part));
    }
}
