package com.mechtech.MyMechanic.service;

import com.mechtech.MyMechanic.entity.Vehicle;
import com.mechtech.MyMechanic.exception.UniqueConstraintViolationException;
import com.mechtech.MyMechanic.repository.VehicleRepository;
import com.mechtech.MyMechanic.repository.projection.VehicleProjection;
import com.mechtech.MyMechanic.repository.specification.VehicleSpecification;
import com.mechtech.MyMechanic.web.dto.vehicle.VehicleCreateDto;
import com.mechtech.MyMechanic.web.dto.vehicle.VehicleUpdateDto;
import com.mechtech.MyMechanic.web.mapper.VehicleMapper;
import org.springframework.context.annotation.Lazy;
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
public class VehicleService extends AbstractTenantAwareService<Vehicle, Long, VehicleRepository> {

    private final ClientService clientService;
    private final ProjectionFactory projectionFactory;
    private final VehicleMapper vehicleMapper;
    private final VehicleModelService vehicleModelService;

    public VehicleService(VehicleRepository repository, @Lazy ClientService clientService, ProjectionFactory projectionFactory, VehicleMapper vehicleMapper, VehicleModelService vehicleModelService) {
        super(repository);
        this.clientService = clientService;
        this.projectionFactory = projectionFactory;
        this.vehicleMapper = vehicleMapper;
        this.vehicleModelService = vehicleModelService;
    }

    @Transactional
    public Vehicle createVehicle(VehicleCreateDto dto) {
        Vehicle newVehicle = vehicleMapper.toVehicle(dto, clientService.findById(dto.getClientId()), vehicleModelService.findById(dto.getModelId()) );
        newVehicle.setTenantId(getTenantId());
        try {
            validateVehicle(newVehicle);
            return repository.save(newVehicle);
        } catch (DataIntegrityViolationException ex) {
            throw new UniqueConstraintViolationException(Objects.requireNonNull(ex.getRootCause()).getMessage());
        }
    }

    @Transactional
    public Vehicle updateVehicle(Long id, VehicleUpdateDto dto) {
        Vehicle vehicleToUpdate = findById(id);
        vehicleMapper.updateVehicleFromDto(dto, vehicleToUpdate);

        vehicleToUpdate.setClient(clientService.findById(dto.getClientId()));
        vehicleToUpdate.setModel(vehicleModelService.findById(dto.getModelId()));

        validateVehicle(vehicleToUpdate);

        return repository.save(vehicleToUpdate);
    }

    @Transactional
    public void deleteVehicle(Long id) {
        Vehicle vehicleToDelete = findById(id);
        repository.delete(vehicleToDelete);
    }


    @Transactional(readOnly = true)
    public Page<VehicleProjection> findAll(Pageable pageable) {
        Page<Vehicle> vehiclesPage = repository.findAll(pageable);
        return vehiclesPage.map(vehicle -> projectionFactory.createProjection(VehicleProjection.class, vehicle));
    }

    @Transactional(readOnly = true)
    public Page<VehicleProjection> findByClientId(Long clientId,Pageable pageable) {
        clientService.findById(clientId);

        Specification<Vehicle> spec = (root, query, cb) -> cb.equal(root.get("client").get("id"), clientId);
        Page<Vehicle> vehiclesPage = repository.findAll(spec, pageable);
        return vehiclesPage.map(vehicle -> projectionFactory.createProjection(VehicleProjection.class, vehicle));
    }

    @Transactional(readOnly = true)
    public Page<VehicleProjection> search(String searchTerm, Pageable pageable) {
        Specification<Vehicle> spec = VehicleSpecification.search(searchTerm);
        Page<Vehicle> vehiclesPage = repository.findAll(spec, pageable);
        return vehiclesPage.map(vehicle -> projectionFactory.createProjection(VehicleProjection.class, vehicle));
    }

    void validateVehicle(Vehicle vehicle){
        Optional<Vehicle> existingVehicle = repository.findByLicensePlate(vehicle.getLicensePlate());
        if (existingVehicle.isPresent() && !existingVehicle.get().getId().equals(vehicle.getId())){
            throw new UniqueConstraintViolationException("Placa já cadastrada");
        }
    }
}
