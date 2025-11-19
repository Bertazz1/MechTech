package com.mechtech.MyMechanic.web.mapper;

import com.mechtech.MyMechanic.entity.Address;
import com.mechtech.MyMechanic.web.dto.client.AddressDto;
import org.springframework.stereotype.Component;

@Component
public class AddressMapper {

    public Address toAddress(AddressDto dto) {
        if (dto == null) {
            return null;
        }
        Address address = new Address();
        address.setStreet(dto.getStreet());
        address.setCity(dto.getCity());
        address.setState(dto.getState());
        address.setZipCode(dto.getZipCode());
        address.setNeighborhood(dto.getNeighborhood());
        address.setNumber(dto.getNumber());
        address.setComplement(dto.getComplement());
        return address;
    }

    public AddressDto toDto(Address address) {
        if (address == null) {
            return null;
        }
        AddressDto dto = new AddressDto();
        dto.setStreet(address.getStreet());
        dto.setCity(address.getCity());
        dto.setState(address.getState());
        dto.setZipCode(address.getZipCode());
        dto.setNeighborhood(address.getNeighborhood());
        dto.setNumber(address.getNumber());
        dto.setComplement(address.getComplement());
        return dto;
    }

    public void updateFromDto(AddressDto dto, Address address) {
        if (dto == null || address == null) {
            return;
        }
        if (dto.getStreet() != null) {
            address.setStreet(dto.getStreet());
        }
        if (dto.getCity() != null) {
            address.setCity(dto.getCity());
        }
        if (dto.getState() != null) {
            address.setState(dto.getState());
        }
        if (dto.getZipCode() != null) {
            address.setZipCode(dto.getZipCode());
        }
        if (dto.getNeighborhood() != null) {
            address.setNeighborhood(dto.getNeighborhood());
        }
        if (dto.getNumber() != null) {
            address.setNumber(dto.getNumber());
        }
        if (dto.getComplement() != null) {
            address.setComplement(dto.getComplement());
        }
    }
}