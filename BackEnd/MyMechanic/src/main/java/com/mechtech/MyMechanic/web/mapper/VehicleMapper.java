package com.mechtech.MyMechanic.web.mapper;

import com.mechtech.MyMechanic.entity.Client;
import com.mechtech.MyMechanic.entity.Vehicle;
import com.mechtech.MyMechanic.entity.VehicleBrand;
import com.mechtech.MyMechanic.entity.VehicleModel;
import com.mechtech.MyMechanic.web.dto.vehicle.VehicleCreateDto;
import com.mechtech.MyMechanic.web.dto.vehicle.VehicleResponseDto;
import com.mechtech.MyMechanic.web.dto.vehicle.VehicleUpdateDto;
import com.mechtech.MyMechanic.web.dto.vehicle.vehiclebrand.VehicleBrandResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class VehicleMapper {


    private final ClientMapper clientMapper;

    public Vehicle toVehicle(VehicleCreateDto dto, Client client, VehicleModel model) {
        if (dto == null) {
            return null;
        }
        Vehicle vehicle = new Vehicle();
        vehicle.setYear(dto.getYear());
        vehicle.setLicensePlate(dto.getLicensePlate());
        vehicle.setModel(model);
        vehicle.setColor(dto.getColor());
        vehicle.setClient(client);
        return vehicle;
    }

    public void updateVehicleFromDto(VehicleUpdateDto dto, Vehicle vehicle) {
        if (dto == null || vehicle == null) {
            return;
        }
        vehicle.setYear(dto.getYear());
        if (dto.getLicensePlate() != null) {
            vehicle.setLicensePlate(dto.getLicensePlate());
        }


        if (dto.getColor() != null) {
            vehicle.setColor(dto.getColor());
        }

        if (dto.getClientId() != null) {
            Client client = new Client();
            client.setId(dto.getClientId());
            vehicle.setClient(client);
        }

    }

    public VehicleResponseDto toDto(Vehicle vehicle) {
        if (vehicle == null) {
            return null;
        }
        VehicleResponseDto dto = new VehicleResponseDto();
        dto.setId(vehicle.getId());
        dto.setYear(vehicle.getYear());
        dto.setLicensePlate(vehicle.getLicensePlate());
        if (vehicle.getModel() != null) {
            dto.setModel(new com.mechtech.MyMechanic.web.dto.vehicle.vehiclemodel.VehicleModelResponseDto(
                    vehicle.getModel().getId(),
                    vehicle.getModel().getName(),
                    vehicle.getModel().getBrand().getName()
            ));
        }

        dto.setColor(vehicle.getColor());
        if(vehicle.getClient() != null) {
            dto.setClient(clientMapper.toDto(vehicle.getClient()));
        }
        return dto;
    }

    public List<VehicleResponseDto> toListDto(List<Vehicle> vehicles) {
        if (vehicles == null) {
            return null;
        }
        return vehicles.stream().map(this::toDto).collect(Collectors.toList());
    }
}