package com.mechtech.MyMechanic.service;

import com.mechtech.MyMechanic.entity.Vehicle;
import com.mechtech.MyMechanic.exception.UniqueConstraintViolationException;
import com.mechtech.MyMechanic.repository.VehicleRepository;
import com.mechtech.MyMechanic.repository.projection.VehicleProjection;
import com.mechtech.MyMechanic.repository.specification.VehicleSpecification;
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

    public VehicleService(VehicleRepository repository, @Lazy ClientService clientService, ProjectionFactory projectionFactory) {
        super(repository);
        this.clientService = clientService;
        this.projectionFactory = projectionFactory;
    }

    @Transactional
    public Vehicle createVehicle(Vehicle vehicle) {
        try {
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
    public Vehicle updateVehicle(Long id, Vehicle vehicleDetails) {

        validateVehicle(vehicleDetails);

        Vehicle existingVehicle = findById(id); // Validação de tenant já inclusa

        existingVehicle.setYear(vehicleDetails.getYear());
        existingVehicle.setLicensePlate(vehicleDetails.getLicensePlate());
        existingVehicle.setModel(vehicleDetails.getModel());
        existingVehicle.setColor(vehicleDetails.getColor());

        return repository.save(existingVehicle);
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
        // Primeiro, valida se o cliente pertence ao tenant atual.
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
