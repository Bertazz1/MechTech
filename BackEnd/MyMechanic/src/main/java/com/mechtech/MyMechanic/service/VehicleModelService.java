package com.mechtech.MyMechanic.service;


import com.mechtech.MyMechanic.entity.Part;
import com.mechtech.MyMechanic.entity.VehicleModel;
import com.mechtech.MyMechanic.exception.UniqueConstraintViolationException;
import com.mechtech.MyMechanic.repository.VehicleModelRepository;
import com.mechtech.MyMechanic.repository.projection.PartProjection;
import com.mechtech.MyMechanic.repository.projection.VehicleModelProjection;
import com.mechtech.MyMechanic.repository.specification.PartSpecification;
import com.mechtech.MyMechanic.repository.specification.VehicleModelSpecification;
import com.mechtech.MyMechanic.service.AbstractTenantAwareService;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.projection.ProjectionFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;
import java.util.Optional;

import static com.mechtech.MyMechanic.multiTenants.TenantContext.getTenantId;

@Service
public class VehicleModelService extends AbstractTenantAwareService<VehicleModel, Long, VehicleModelRepository> {

    private final ProjectionFactory projectionFactory;


    public VehicleModelService(VehicleModelRepository repository, ProjectionFactory projectionFactory) {
        super(repository);
        this.projectionFactory = projectionFactory;
    }

    @Transactional
    public VehicleModel createVehicleModel(VehicleModel vehicleModel) {
        vehicleModel.setTenantId(getTenantId());
        try {
            validateVehicleModel(vehicleModel);
            return repository.save(vehicleModel);
        } catch (DataIntegrityViolationException ex) {
            throw new UniqueConstraintViolationException(Objects.requireNonNull(ex.getRootCause()).getMessage());
        }
    }

    @Transactional
    public VehicleModel updateVehicleModel(Long id, VehicleModel vehicleModelDetails) {
        VehicleModel existingVehicleModel = findById(id); // Validação de tenant já inclusa

        existingVehicleModel.setName(vehicleModelDetails.getName());
        existingVehicleModel.setBrand(vehicleModelDetails.getBrand());

        validateVehicleModel(existingVehicleModel);

        return repository.save(existingVehicleModel);
    }

    @Transactional
    public void deleteVehicleModel(Long id) {
        VehicleModel vehicleModelToDelete = findById(id);
        repository.delete(vehicleModelToDelete);
    }

    private void validateVehicleModel(VehicleModel vehicleModel) {
        Optional<VehicleModel> existingVehicleModel = repository.findByName(vehicleModel.getName());
        if (existingVehicleModel.isPresent() && !existingVehicleModel.get().getId().equals(vehicleModel.getId())) {
            throw new UniqueConstraintViolationException("Modelo de veículo já cadastrado com este nome.");
        }
    }

    @Transactional(readOnly = true)
    public Page<VehicleModelProjection> findAll(Pageable pageable) {
        Page<VehicleModel> page = repository.findAll(pageable);
        return page.map(modal -> projectionFactory.createProjection(VehicleModelProjection.class, modal));
    }

    public Page<VehicleModelProjection> search(String query, Pageable pageable) {
        Specification<VehicleModel> spec = VehicleModelSpecification.search(query);
        Page<VehicleModel> page = repository.findAll(spec, pageable);
        return page.map(vehicleModel -> projectionFactory.createProjection(VehicleModelProjection.class, vehicleModel));
    }



}




