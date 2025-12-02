package com.mechtech.MyMechanic.service;

import com.mechtech.MyMechanic.entity.Client;
import com.mechtech.MyMechanic.exception.EntityNotFoundException;
import com.mechtech.MyMechanic.exception.UniqueConstraintViolationException;
import com.mechtech.MyMechanic.multiTenants.TenantContext;
import com.mechtech.MyMechanic.repository.ClientRepository;
import com.mechtech.MyMechanic.repository.projection.ClientProjection;
import com.mechtech.MyMechanic.repository.specification.ClientSpecification;
import com.mechtech.MyMechanic.util.ValidationUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.projection.ProjectionFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class ClientService extends AbstractTenantAwareService<Client, Long, ClientRepository> {

    private final VehicleService vehicleService;
    private final ClientRepository clientRepository;
    private final ProjectionFactory projectionFactory;

    public ClientService(ClientRepository repository, VehicleService vehicleService,
                         ClientRepository clientRepository, ProjectionFactory projectionFactory) {
        super(repository);
        this.vehicleService = vehicleService;
        this.clientRepository = clientRepository;
        this.projectionFactory = projectionFactory;
    }


    @Transactional
    public Client createClient(Client client) {
        ValidationUtils.validateCpf(client.getCpf());
        validateClient(client);

        try {
            client.setTenant(TenantContext.getTenant());
            return repository.save(client);
        } catch (Exception ex) {
            throw new UniqueConstraintViolationException(
                   "Erro de violação de restrição de unicidade: " + ex.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public Page<ClientProjection> findAll(Pageable pageable) {
        Page<Client> clientsPage = repository.findAll(pageable);
        return clientsPage.map(client -> projectionFactory.createProjection(ClientProjection.class, client));
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
    public Page<ClientProjection> search(String searchTerm, Pageable pageable) {
        Specification<Client> spec = ClientSpecification.search(searchTerm);
        Page<Client> clientsPage = repository.findAll(spec, pageable);
        return clientsPage.map(client -> projectionFactory.createProjection(ClientProjection.class, client));
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
