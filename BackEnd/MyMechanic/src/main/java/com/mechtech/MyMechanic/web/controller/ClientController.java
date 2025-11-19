package com.mechtech.MyMechanic.web.controller;

import com.mechtech.MyMechanic.config.security.IsAdmin;
import com.mechtech.MyMechanic.config.security.IsAdminOrClient;
import com.mechtech.MyMechanic.config.security.IsAdminOrOwner;
import com.mechtech.MyMechanic.entity.Client;
import com.mechtech.MyMechanic.repository.projection.ClientProjection;
import com.mechtech.MyMechanic.service.ClientService;
import com.mechtech.MyMechanic.web.dto.client.ClientCreateDto;
import com.mechtech.MyMechanic.web.dto.client.ClientProjectionDto;
import com.mechtech.MyMechanic.web.dto.client.ClientResponseDto;
import com.mechtech.MyMechanic.web.dto.client.ClientUpdateDto;
import com.mechtech.MyMechanic.web.dto.pageable.PageableDto;
import com.mechtech.MyMechanic.web.mapper.ClientMapper;
import com.mechtech.MyMechanic.web.mapper.PageableMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/clients")
public class ClientController {

    private final ClientService clientService;
    private final ClientMapper clientMapper;
    private final PageableMapper pageableMapper;

    @PostMapping
    @IsAdminOrClient
    public ResponseEntity<ClientResponseDto> createClient(@Valid @RequestBody ClientCreateDto dto) {
        Client createdClient = clientService.createClient(clientMapper.toClient(dto));
        return ResponseEntity.status(HttpStatus.CREATED).body(clientMapper.toDto(createdClient));
    }

    @GetMapping("/{id}")
    @IsAdminOrOwner(id = "#id")
    public ResponseEntity<ClientResponseDto> getClientById(@PathVariable Long id) {
        Client client = clientService.findById(id);
        return ResponseEntity.ok(clientMapper.toDto(client));
    }

    @GetMapping
    @IsAdmin
    public ResponseEntity<PageableDto> getAllClients(Pageable pageable) {
        Page<ClientProjection> clientPage = clientService.findAll(pageable);
        Page<ClientProjectionDto> dtoPage = clientPage.map(clientMapper::toProjectionDto);
        return ResponseEntity.ok(pageableMapper.toDto(dtoPage));
    }


    @GetMapping("/by-vehicle/{vehicleId}")
    public ResponseEntity<ClientResponseDto> getClientByVehicleId(@PathVariable Long vehicleId) {
        Client client = clientService.findByVehicleId(vehicleId);
        return ResponseEntity.ok(clientMapper.toDto(client));
    }

    @GetMapping("/search/by-name")
    public ResponseEntity<PageableDto> findByName(@RequestParam String name, Pageable pageable) {
        Page<ClientProjection> clientPage = clientService.findAllByName(name, pageable);
        return ResponseEntity.ok(pageableMapper.toDto(clientPage));
    }


    @PutMapping("/{id}")
    @IsAdminOrOwner(id = "#id")
    public ResponseEntity<ClientResponseDto> updateClient(@PathVariable Long id,
                                                          @Valid @RequestBody ClientUpdateDto dto) {
        Client client = clientService.findById(id);
        clientMapper.updateClientFromDto(dto, client);
        Client updated = clientService.updateClient(id, client);
        return ResponseEntity.ok(clientMapper.toDto(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteClient(@PathVariable Long id) {
        Client client = clientService.findById(id);
        clientService.delete(client);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<PageableDto> searchClients(@RequestParam(name = "q", required = false) String query, Pageable pageable) {
        Page<Client> clientPage = clientService.search(query, pageable);
        Page<ClientResponseDto> dtoPage = clientPage.map(clientMapper::toDto);
        return ResponseEntity.ok(pageableMapper.toDto(dtoPage));
    }

}