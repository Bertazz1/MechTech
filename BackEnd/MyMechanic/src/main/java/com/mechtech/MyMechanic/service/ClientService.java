package com.mechtech.MyMechanic.service;

import com.mechtech.MyMechanic.entity.Client;
import com.mechtech.MyMechanic.exception.EntityNotFoundException;
import com.mechtech.MyMechanic.exception.UniqueConstraintViolationException;
import com.mechtech.MyMechanic.multiTenants.TenantContext;
import com.mechtech.MyMechanic.repository.ClientRepository;
import com.mechtech.MyMechanic.repository.projection.ClientProjection;
import com.mechtech.MyMechanic.repository.specification.ClientSpecification;
import com.mechtech.MyMechanic.util.ValidationUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ClientService extends AbstractTenantAwareService<Client, Long, ClientRepository> {

//    private final AddressService addressService;
    private final VehicleService vehicleService;

    public ClientService(ClientRepository repository, AddressService addressService, VehicleService vehicleService) {
        super(repository);
//        this.addressService = addressService;
        this.vehicleService = vehicleService;
    }

    @Transactional
    public Client createClient(Client client) {
        ValidationUtils.validateCpf(client.getCpf());

        try {
            client.setTenantId(TenantContext.getTenantId());
            return repository.save(client);
        } catch (DataIntegrityViolationException ex) {
            throw new UniqueConstraintViolationException(
                   ex.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public Page<ClientProjection> findAll(Pageable pageable) {
        return repository.findAllProjectedBy(pageable);
    }

    @Transactional(readOnly = true)
    public Client findByEmail(String email) {
        Client client = repository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Cliente nao encontrado: " + email));
        validateTenant(client);
        return client;
    }

    @Transactional
    public Client updateClient(Long id, Client clientUpdateData) {
        Client existingClient = findById(id);
        if (clientUpdateData.getCpf() != null) {
            ValidationUtils.validateCpf(clientUpdateData.getCpf());
        }

        existingClient.setName(clientUpdateData.getName());
        existingClient.setEmail(clientUpdateData.getEmail());
        existingClient.setPhone(clientUpdateData.getPhone());
        existingClient.setAddress(clientUpdateData.getAddress());
        existingClient.setCpf(clientUpdateData.getCpf());

        return repository.save(existingClient);
    }

    @Transactional
    public void delete(Client client) {
        if (client == null || client.getId() == null) {
            throw new EntityNotFoundException("Cliente nao encontrado");
        }
        validateTenant(client);
        repository.delete(client);
    }

    @Transactional(readOnly = true)
    public Client findByVehicleId(Long vehicleId) {
        vehicleService.findById(vehicleId);
        return repository.findByVehicles_Id(vehicleId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Cliente não encontrado para o veículo com id: " + vehicleId));
    }

    @Transactional(readOnly = true)
    public Page<ClientProjection> findAllByName(String name, Pageable pageable) {
        return repository.findByNameContainingIgnoreCase(name, pageable);
    }

    @Transactional(readOnly = true)
    public Page<Client> search(String searchTerm, Pageable pageable) {
        return repository.findAll(ClientSpecification.search(searchTerm), pageable);
    }
}