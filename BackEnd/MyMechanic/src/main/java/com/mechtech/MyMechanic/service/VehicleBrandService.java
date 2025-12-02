package com.mechtech.MyMechanic.service;

import com.mechtech.MyMechanic.entity.VehicleBrand;
import com.mechtech.MyMechanic.entity.VehicleModel;
import com.mechtech.MyMechanic.exception.UniqueConstraintViolationException;
import com.mechtech.MyMechanic.repository.VehicleBrandRepository;
import com.mechtech.MyMechanic.repository.projection.VehicleBrandProjection;
import com.mechtech.MyMechanic.repository.projection.VehicleModelProjection;
import com.mechtech.MyMechanic.repository.specification.VehicleBrandSpecification;
import com.mechtech.MyMechanic.repository.specification.VehicleModelSpecification;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.projection.ProjectionFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;
import java.util.Optional;

import static com.mechtech.MyMechanic.multiTenants.TenantContext.getTenant;

@Service
public class VehicleBrandService extends AbstractTenantAwareService<VehicleBrand, Long, VehicleBrandRepository> {

    ProjectionFactory projectionFactory;


    public VehicleBrandService(VehicleBrandRepository repository, ProjectionFactory projectionFactory) {
        super(repository);
        this.projectionFactory = projectionFactory;
    }

    @Transactional
    public VehicleBrand createVehicleBrand(VehicleBrand vehicleBrand) {
            vehicleBrand.setTenant(getTenant());
        try {
            validateVehicleBrand(vehicleBrand);
            return repository.save(vehicleBrand);
        } catch (DataIntegrityViolationException ex) {
            throw new UniqueConstraintViolationException(Objects.requireNonNull(ex.getRootCause()).getMessage());
        }
    }

    @Transactional
    public VehicleBrand updateVehicleBrand(Long id, VehicleBrand vehicleBrandDetails) {
        VehicleBrand existingVehicleBrand = findById(id); // Validação de tenant já inclusa

        existingVehicleBrand.setName(vehicleBrandDetails.getName());

        validateVehicleBrand(existingVehicleBrand);

        return repository.save(existingVehicleBrand);
    }

    @Transactional
    public void deleteVehicleBrand(Long id) {
        VehicleBrand vehicleBrandToDelete = findById(id); // Validação de tenant já inclusa
        repository.delete(vehicleBrandToDelete);
    }

    private void validateVehicleBrand(VehicleBrand vehicleBrand) {
        Optional<VehicleBrand> existingVehicleBrand = repository.findByName(vehicleBrand.getName());
        if (existingVehicleBrand.isPresent() && !existingVehicleBrand.get().getId().equals(vehicleBrand.getId())) {
            throw new UniqueConstraintViolationException("Marca de veículo já cadastrada com este nome.");
        }
    }

    public Page<VehicleBrandProjection> findAll(Pageable pageable) {
        Page<VehicleBrand> vehicleBrandsPage = repository.findAll(pageable);
        return vehicleBrandsPage.map(vehicleBrand -> projectionFactory.createProjection(VehicleBrandProjection.class, vehicleBrand));
    }

    public Page<VehicleBrandProjection> search(String query, Pageable pageable) {
        Specification<VehicleBrand> spec = VehicleBrandSpecification.search(query);
        Page<VehicleBrand> page = repository.findAll(spec, pageable);
        return page.map(vehicleBrand -> projectionFactory.createProjection(VehicleBrandProjection.class, vehicleBrand));
    }
}


