package com.mechtech.MyMechanic.web.mapper;

import com.mechtech.MyMechanic.entity.VehicleBrand;
import com.mechtech.MyMechanic.entity.VehicleModel;
import com.mechtech.MyMechanic.service.VehicleBrandService;
import com.mechtech.MyMechanic.web.dto.vehicle.vehiclemodel.VehicleModelCreateDto;
import com.mechtech.MyMechanic.web.dto.vehicle.vehiclemodel.VehicleModelResponseDto;
import com.mechtech.MyMechanic.web.dto.vehicle.vehiclemodel.VehicleModelUpdateDto;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;


@Component
public class VehicleModelMapper {

    private final VehicleBrandService vehicleBrandService;
    private final VehicleBrandMapper vehicleBrandMapper;

    public VehicleModelMapper(VehicleBrandService vehicleBrandService, VehicleBrandMapper vehicleBrandMapper) {
        this.vehicleBrandService = vehicleBrandService;
        this.vehicleBrandMapper = vehicleBrandMapper;
    }


    public VehicleModel toVehicleModel(VehicleModelCreateDto dto) {
        if (dto == null) {
            return null;
        }
        VehicleBrand brand = vehicleBrandService.findById(dto.getBrandId());

        VehicleModel vehicleModel = new VehicleModel();
        vehicleModel.setName(dto.getName());
        vehicleModel.setBrand(brand);
        return vehicleModel;
    }

    public void updateVehicleModelFromDto(VehicleModelUpdateDto dto, VehicleModel vehicleModel) {
        if (dto == null || vehicleModel == null) {
            return;
        }
        if (dto.getName() != null) {
            vehicleModel.setName(dto.getName());
        }
        if (dto.getBrandId() != null) {
            VehicleBrand brand = new VehicleBrand();
            brand.setId(dto.getBrandId());
            vehicleModel.setBrand(brand);
        }
    }

    public VehicleModelResponseDto toDto(VehicleModel vehicleModel) {
        if (vehicleModel == null) {
            return null;
        }
        VehicleModelResponseDto dto = new VehicleModelResponseDto();
        dto.setId(vehicleModel.getId());
        dto.setName(vehicleModel.getName());
        if (vehicleModel.getBrand() != null) {
            dto.setBrand(vehicleBrandMapper.toDto(vehicleModel.getBrand()));
        }
        return dto;
    }

    public List<VehicleModelResponseDto> toListDto(List<VehicleModel> vehicleModels) {
        if (vehicleModels == null) {
            return null;
        }
        return vehicleModels.stream().map(this::toDto).collect(Collectors.toList());
    }
}
