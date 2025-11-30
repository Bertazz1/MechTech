
package com.mechtech.MyMechanic.web.mapper;

import com.mechtech.MyMechanic.entity.VehicleBrand;
import com.mechtech.MyMechanic.web.dto.vehicle.vehiclebrand.VehicleBrandCreateDto;
import com.mechtech.MyMechanic.web.dto.vehicle.vehiclebrand.VehicleBrandResponseDto;
import com.mechtech.MyMechanic.web.dto.vehicle.vehiclebrand.VehicleBrandUpdateDto;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class VehicleBrandMapper {

    public VehicleBrand toVehicleBrand(VehicleBrandCreateDto dto) {
        if (dto == null) {
            return null;
        }
        VehicleBrand vehicleBrand = new VehicleBrand();
        vehicleBrand.setName(dto.getName());
        return vehicleBrand;
    }

    public void updateVehicleBrandFromDto(VehicleBrandUpdateDto dto, VehicleBrand vehicleBrand) {
        if (dto == null || vehicleBrand == null) {
            return;
        }
        if (dto.getName() != null) {
            vehicleBrand.setName(dto.getName());
        }
    }

    public VehicleBrandResponseDto toDto(VehicleBrand vehicleBrand) {
        if (vehicleBrand == null) {
            return null;
        }
        VehicleBrandResponseDto dto = new VehicleBrandResponseDto();
        dto.setId(vehicleBrand.getId());
        dto.setName(vehicleBrand.getName());
        return dto;
    }

    public List<VehicleBrandResponseDto> toListDto(List<VehicleBrand> vehicleBrands) {
        if (vehicleBrands == null) {
            return null;
        }
        return vehicleBrands.stream().map(this::toDto).collect(Collectors.toList());
    }

}
