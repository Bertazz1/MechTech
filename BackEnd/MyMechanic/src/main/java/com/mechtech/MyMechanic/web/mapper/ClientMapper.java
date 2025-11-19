package com.mechtech.MyMechanic.web.mapper;

import com.mechtech.MyMechanic.entity.Address;
import com.mechtech.MyMechanic.entity.Client;
import com.mechtech.MyMechanic.entity.Vehicle;
import com.mechtech.MyMechanic.repository.projection.ClientProjection;
import com.mechtech.MyMechanic.web.dto.client.ClientCreateDto;
import com.mechtech.MyMechanic.web.dto.client.ClientProjectionDto;
import com.mechtech.MyMechanic.web.dto.client.ClientResponseDto;
import com.mechtech.MyMechanic.web.dto.client.ClientUpdateDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ClientMapper {

    private final AddressMapper addressMapper;

    public Client toClient(ClientCreateDto dto) {
        if (dto == null) {
            return null;
        }
        Client client = new Client();
        client.setName(dto.getName());
        client.setEmail(dto.getEmail());
        client.setPhone(dto.getPhone());
        client.setAddress(addressMapper.toAddress(dto.getAddress()));
        client.setCpf(dto.getCpf());
        return client;
    }

    public ClientResponseDto toDto(Client client) {
        if (client == null) {
            return null;
        }
        ClientResponseDto dto = new ClientResponseDto();
        dto.setId(client.getId());
        dto.setName(client.getName());
        dto.setEmail(client.getEmail());
        dto.setPhone(client.getPhone());
        dto.setAddress(addressMapper.toDto(client.getAddress()));
        dto.setCpf(client.getCpf());
        return dto;
    }

    public void updateClientFromDto(ClientUpdateDto dto, Client client) {
        if (dto == null || client == null) {
            return;
        }
        if (dto.getName() != null) {
            client.setName(dto.getName());
        }
        if (dto.getEmail() != null) {
            client.setEmail(dto.getEmail());
        }
        if (dto.getPhone() != null) {
            client.setPhone(dto.getPhone());
        }
        if (dto.getCpf() != null) {
            client.setCpf(dto.getCpf());
        }
        if (dto.getAddress() != null) {
            if (client.getAddress() == null) {

                client.setAddress(new Address());
            }
            addressMapper.updateFromDto(dto.getAddress(), client.getAddress());
        }
    }

    public List<ClientResponseDto> toListDto(List<Client> clients) {
        if (clients == null) {
            return null;
        }
        return clients.stream().map(this::toDto).collect(Collectors.toList());
    }

    public ClientProjectionDto toProjectionDto(ClientProjection projection){
        if (projection == null) {
            return null;
        }
        ClientProjectionDto dto = new ClientProjectionDto();
        dto.setId(projection.getId());
        dto.setName(projection.getName());
        dto.setEmail(projection.getEmail());
        dto.setPhone(projection.getPhone());
        dto.setCpf(projection.getCpf());
        dto.setAddress(addressMapper.toDto(projection.getAddress()));
        return dto;

    };
}