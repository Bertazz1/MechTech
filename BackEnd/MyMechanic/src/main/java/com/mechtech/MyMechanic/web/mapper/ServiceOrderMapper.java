package com.mechtech.MyMechanic.web.mapper;

import com.mechtech.MyMechanic.entity.*;
import com.mechtech.MyMechanic.web.dto.serviceorder.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ServiceOrderMapper {

    private final ClientMapper clientMapper;
    private final VehicleMapper vehicleMapper;

    public ServiceOrderResponseDto toDto(ServiceOrder serviceOrder) {
        if (serviceOrder == null) {
            return null;
        }

        ServiceOrderResponseDto dto = new ServiceOrderResponseDto();
        dto.setId(serviceOrder.getId());
        dto.setStatus(serviceOrder.getStatus().name());
        dto.setDescription(serviceOrder.getDescription());
        dto.setEntryDate(serviceOrder.getEntryDate());
        dto.setExitDate(serviceOrder.getExitDate());
        dto.setTotalCost(serviceOrder.getTotalCost());
        dto.setInitialMileage(serviceOrder.getInitialMileage());
        dto.setClient(clientMapper.toDto(serviceOrder.getClient()));
        dto.setVehicle(vehicleMapper.toDto(serviceOrder.getVehicle()));

        if (serviceOrder.getQuotation() != null) {
            dto.setQuotationId(serviceOrder.getQuotation().getId());
        }

        if (serviceOrder.getEmployees() != null) {
            dto.setEmployees(serviceOrder.getEmployees().stream()
                    .map(soEmployee -> new ServiceOrderEmployeeResponseDto(
                            soEmployee.getId(),
                            soEmployee.getEmployee().getId(),
                            soEmployee.getEmployee().getName(),
                            soEmployee.getCommissionPercentage(),
                            soEmployee.getEmployee().getRole().getName()
                    ))
                    .collect(Collectors.toList()));
        }

        // Mapeia os itens de peças para os seus DTOs de resposta
        if (serviceOrder.getPartItems() != null) {
            dto.setPartItems(serviceOrder.getPartItems().stream()
                    .map(item -> new ServiceOrderPartItemResponseDto(
                            item.getId(),
                            item.getPart().getId(),
                            item.getPart().getName(),
                            item.getPart().getCode(),
                            item.getQuantity(),
                            item.getUnitPrice()
                    ))
                    .collect(Collectors.toList()));
        }

        // Mapeia os itens de serviço para os seus DTOs de resposta
        if (serviceOrder.getServiceItems() != null) {
            dto.setServiceItems(serviceOrder.getServiceItems().stream()
                    .map(item -> new ServiceOrderServiceItemResponseDto(
                            item.getId(),
                            item.getRepairService().getId(),
                            item.getRepairService().getName(),
                            item.getQuantity(),
                            item.getServiceCost()
                    ))
                    .collect(Collectors.toList()));
        }

        return dto;
    }


}