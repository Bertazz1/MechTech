package com.mechtech.MyMechanic.web.mapper;

import com.mechtech.MyMechanic.entity.*;
import com.mechtech.MyMechanic.web.dto.part.PartCreateDto;
import com.mechtech.MyMechanic.web.dto.part.PartResponseDto;
import com.mechtech.MyMechanic.web.dto.part.PartUpdateDto;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class PartMapper {

    public Part toPart(PartCreateDto dto) {
        if (dto == null) {
            return null;
        }
        Part part = new Part();
        part.setName(dto.getName());
        part.setPrice(dto.getPrice());
        part.setDescription(dto.getDescription());
        part.setCode(dto.getCode());
        part.setSupplier(dto.getSupplier());
        return part;
    }

    public PartResponseDto toDto(Part part) {
        if (part == null) {
            return null;
        }
        PartResponseDto dto = new PartResponseDto();
        dto.setId(part.getId());
        dto.setName(part.getName());
        dto.setDescription(part.getDescription());
        dto.setCode(part.getCode());
        dto.setPrice(part.getPrice());
        dto.setSupplier(part.getSupplier());

        return dto;
    }

    public List<PartResponseDto> toListDto(List<Part> parts) {
        if (parts == null) {
            return null;
        }
        return parts.stream().map(this::toDto).collect(Collectors.toList());
    }

    public void updatePartFromDto(PartUpdateDto dto, Part part) {
        if (dto == null || part == null) {
            return;
        }
        if (dto.getName() != null) {
            part.setName(dto.getName());
        }
        if (dto.getPrice() != null) {
            part.setPrice(dto.getPrice());
        }
        if (dto.getDescription() != null) {
            part.setDescription(dto.getDescription());
        }
        if (dto.getCode() != null) {
            part.setCode(dto.getCode());
        }
        if (dto.getSupplier() != null) {
            part.setSupplier(dto.getSupplier());
        }

    }
}