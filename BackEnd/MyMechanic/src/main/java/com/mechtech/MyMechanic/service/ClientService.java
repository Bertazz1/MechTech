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

import java.util.Optional;

@Service
public class ClientService extends AbstractTenantAwareService<Client, Long, ClientRepository> {

//    private final AddressService addressService;
    private final VehicleService vehicleService;
    private final ClientRepository clientRepository;

    public ClientService(ClientRepository repository, AddressService addressService, VehicleService vehicleService,
                         ClientRepository clientRepository) {
        super(repository);
//        this.addressService = addressService;
        this.vehicleService = vehicleService;
        this.clientRepository = clientRepository;
    }


    @Transactional
    public Client createClient(Client client) {
        ValidationUtils.validateCpf(client.getCpf());
        validateClient(client);

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


        validateClient(existingClient);

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

    private void validateClient(Client client){
        Optional<Client> existingCpfClient = clientRepository.findByCpf(client.getCpf());
        if (existingCpfClient.isPresent() && !existingCpfClient.get().getId().equals(client.getId())){
            throw new UniqueConstraintViolationException("CPF já cadastrado");
        }

        Optional<Client> existingEmailClient = clientRepository.findByEmail(client.getEmail());
        if (existingEmailClient.isPresent() && !existingEmailClient.get().getId().equals(client.getId())){
            throw new UniqueConstraintViolationException("Email já cadastrado");
        }

        Optional<Client> existingPhoneClient = clientRepository.findByPhone(client.getPhone());
        if (existingPhoneClient.isPresent() && !existingPhoneClient.get().getId().equals(client.getId())){
            throw new UniqueConstraintViolationException("Telefone já cadastrado");
        }
    }
}