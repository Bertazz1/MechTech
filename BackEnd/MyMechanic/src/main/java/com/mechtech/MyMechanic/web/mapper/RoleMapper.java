package com.mechtech.MyMechanic.web.mapper;

import com.mechtech.MyMechanic.entity.Role;
import com.mechtech.MyMechanic.web.dto.role.RoleCreateDto;
import com.mechtech.MyMechanic.web.dto.role.RoleResponseDto;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class RoleMapper {

    public Role toRole(RoleCreateDto dto) {
        if (dto == null) {
            return null;
        }
        Role role = new Role();
        role.setName(dto.getName());
        role.setReceivesCommission(dto.getReceivesCommission());
        return role;
    }

    public RoleResponseDto toDto(Role role) {
        if (role == null) {
            return null;
        }
        RoleResponseDto dto = new RoleResponseDto();
        dto.setId(role.getId());
        dto.setName(role.getName());
        dto.setReceivesCommission(role.isReceivesCommission());
        return dto;
    }

    public List<RoleResponseDto> toListDto(List<Role> roles) {
        return roles.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
}
