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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;
import java.util.Optional;

@Service
public class VehicleService extends AbstractTenantAwareService<Vehicle, Long, VehicleRepository> {

    private final ClientService clientService;

    public VehicleService(VehicleRepository repository, @Lazy ClientService clientService) {
        super(repository);
        this.clientService = clientService;
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
        return repository.findAllProjectedBy(pageable);
    }

    @Transactional(readOnly = true)
    public Page<VehicleProjection> findByClientId(Long clientId,Pageable pageable) {
        // Primeiro, valida se o cliente pertence ao tenant atual.
        clientService.findById(clientId);

        // Se a validação passar, busca os veículos.
        return repository.findByClientId(clientId,pageable);
    }

    @Transactional(readOnly = true)
    public Page<Vehicle> search(String searchTerm, Pageable pageable) {
        return repository.findAll(VehicleSpecification.search(searchTerm), pageable);
    }

    void validateVehicle(Vehicle vehicle){
        Optional<Vehicle> existingVehicle = repository.findByLicensePlate(vehicle.getLicensePlate());
        if (existingVehicle.isPresent() && !existingVehicle.get().getId().equals(vehicle.getId())){
            throw new UniqueConstraintViolationException("Placa já cadastrada");
        }
    }
}