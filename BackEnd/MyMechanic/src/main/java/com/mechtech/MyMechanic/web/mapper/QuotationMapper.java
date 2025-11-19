package com.mechtech.MyMechanic.web.mapper;

import com.mechtech.MyMechanic.entity.*;
import com.mechtech.MyMechanic.web.dto.quotation.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;
import java.util.List;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class QuotationMapper {

    private final ClientMapper clientMapper;
    private final VehicleMapper vehicleMapper;

    public Quotation toQuotation(QuotationCreateDto dto) {
        if (dto == null) {
            return null;
        }
        Quotation quotation = new Quotation();
        quotation.setDescription(dto.getDescription());
        quotation.setEntryTime(dto.getEntryTime());
        return quotation;
    }

    public QuotationResponseDto toDto(Quotation quotation) {
        if (quotation == null) {
            return null;
        }

        QuotationResponseDto dto = new QuotationResponseDto();
        dto.setId(quotation.getId());
        dto.setDescription(quotation.getDescription());
        dto.setStatus(quotation.getStatus().name());
        dto.setEntryTime(quotation.getEntryTime());
        dto.setExitTime(quotation.getExitTime());
        dto.setTotalPrice(quotation.getTotalCost());
        dto.setTotalPartsPrice(quotation.getTotalPartsPrice());
        dto.setTotalServicesPrice(quotation.getTotalServicesPrice());

        if (quotation.getVehicle() != null) {
            dto.setVehicle(vehicleMapper.toDto( quotation.getVehicle()));
        }
        if (quotation.getClient() != null) {
            dto.setClient(clientMapper.toDto(quotation.getClient()));
        }

        if (quotation.getPartItems() != null) {
            dto.setPartItems(quotation.getPartItems().stream()
                    .map(this::partItemToDto)
                    .collect(Collectors.toSet()));
        }

        if (quotation.getServiceItems() != null) {
            dto.setServiceItems(quotation.getServiceItems().stream()
                    .map(this::serviceItemToDto)
                    .collect(Collectors.toSet()));
        }

        return dto;
    }

    private QuotationPartItemResponseDto partItemToDto(QuotationPartItem item) {
        return new QuotationPartItemResponseDto(
                item.getPart().getId(),
                item.getPart().getName(),
                item.getPart().getCode(),
                item.getQuantity(),
                item.getUnitPrice()
        );
    }

    private QuotationServiceItemResponseDto serviceItemToDto(QuotationServiceItem item) {
        return new QuotationServiceItemResponseDto(
                item.getRepairService().getId(),
                item.getRepairService().getName(),
                item.getServiceCost()
        );
    }


    public void updateQuotationFromDto(QuotationUpdateDto dto, Quotation quotation) {
        if (dto == null || quotation == null) {
            return;
        }
        if (dto.getDescription() != null) {
            quotation.setDescription(dto.getDescription());
        }
        if (dto.getStatus() != null) {
            quotation.setStatus(Quotation.QuotationStatus.valueOf(dto.getStatus()));
        }
        if (dto.getEntryTime() != null) {
            quotation.setEntryTime(dto.getEntryTime());
        }
    }

    public List<QuotationResponseDto> toListDto(List<Quotation> quotations) {
        if (quotations == null) {
            return null;
        }
        return quotations.stream().map(this::toDto).collect(Collectors.toList());
    }
}