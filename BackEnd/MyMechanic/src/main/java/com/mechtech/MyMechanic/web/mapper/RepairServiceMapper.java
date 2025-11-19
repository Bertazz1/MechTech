package com.mechtech.MyMechanic.web.mapper;

import com.mechtech.MyMechanic.entity.RepairService;
import com.mechtech.MyMechanic.web.dto.repairservice.RepairServiceCreateDto;
import com.mechtech.MyMechanic.web.dto.repairservice.RepairServiceResponseDto;
import org.springframework.stereotype.Component;

@Component
public class RepairServiceMapper {

    public RepairService toRepairService(RepairServiceCreateDto dto) {
        if (dto == null) {
            return null;
        }
        RepairService service = new RepairService();
        service.setName(dto.getName());
        service.setDescription(dto.getDescription());
        service.setCost(dto.getCost());
        return service;
    }

    public RepairServiceResponseDto toDto(RepairService service) {
        if (service == null) {
            return null;
        }
        RepairServiceResponseDto dto = new RepairServiceResponseDto();
        dto.setId(service.getId());
        dto.setName(service.getName());
        dto.setDescription(service.getDescription());
        dto.setCost(service.getCost());
        return dto;
    }

    public void updateFromDto(RepairServiceCreateDto dto, RepairService service) {
        if (dto == null || service == null) {
            return;
        }
        service.setName(dto.getName());
        service.setDescription(dto.getDescription());
        service.setCost(dto.getCost());
    }
}