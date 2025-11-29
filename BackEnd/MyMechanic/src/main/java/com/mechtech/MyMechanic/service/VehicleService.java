package com.mechtech.MyMechanic.service;

import com.mechtech.MyMechanic.entity.Client;
import com.mechtech.MyMechanic.entity.Vehicle;
import com.mechtech.MyMechanic.entity.VehicleModel;
import com.mechtech.MyMechanic.exception.UniqueConstraintViolationException;
import com.mechtech.MyMechanic.repository.VehicleRepository;
import com.mechtech.MyMechanic.repository.projection.VehicleProjection;
import com.mechtech.MyMechanic.repository.specification.VehicleSpecification;
import com.mechtech.MyMechanic.web.dto.vehicle.VehicleCreateDto;
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
        try {
            VehicleModel model = vehicleModelService.findById(dto.getModelId());
            Client client = clientService.findById(dto.getClientId());
            Vehicle vehicle = vehicleMapper.toVehicle(dto,client,model);
            if (vehicle.getClient() != null) {
                vehicle.setTenantId(vehicle.getClient().getTenantId());
            }
            validateVehicle(vehicle);
            return repository.save(vehicle);
        } catch (DataIntegrityViolationException ex) {
            throw new UniqueConstraintViolationException(Objects.requireNonNull(ex.getRootCause()).getMessage());
        }
    }

    @Transactional
    public Vehicle updateVehicle(Vehicle vehicle) {
        validateVehicle(vehicle);
        return repository.save(vehicle);
    }

    @Transactional
    public void deleteVehicle(Long id) {
        Vehicle vehicleToDelete = findById(id); // Validação de tenant já inclusa
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

        // Se a validação passar, busca os veículos.
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
