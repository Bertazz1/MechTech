package com.mechtech.MyMechanic.web.mapper;

import com.mechtech.MyMechanic.entity.User;
import com.mechtech.MyMechanic.web.dto.user.UserCreateDto;
import com.mechtech.MyMechanic.web.dto.user.UserResponseDto;
import com.mechtech.MyMechanic.web.dto.user.UserUpdateDto;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class UserMapper {

    public User toUser(UserCreateDto dto) {
        if (dto == null) return null;
        User user = new User();
        user.setFullName(dto.getFullname());
        user.setPassword(dto.getPassword());
        user.setEmail(dto.getEmail());
        user.setPhone(dto.getPhone());
        user.setTenantId(dto.getTenantId());
        user.setRole(dto.getRole() != null ? User.Role.valueOf(dto.getRole()) : User.Role.ROLE_CLIENT);
        return user;
    }

    public UserResponseDto toDto(User user) {
        if (user == null) return null;

        UserResponseDto dto = new UserResponseDto();
        dto.setId(user.getId());
        dto.setFullname(user.getFullName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());

        if (user.getRole() != null) {
            dto.setRole(user.getRole().name());
        }

        if (user.getTenantId() != null) {
            dto.setTenantId(user.getTenantId());
        }

        if (user.getStatus() != null) {
            dto.setStatus(user.getStatus().name());
        }
        return dto;
    }

    public void updateFromDTO(UserUpdateDto dto, User user) {
        if (dto == null || user == null) return;
        if (dto.getEmail() != null) user.setEmail(dto.getEmail());
        if (dto.getPhone() != null) user.setPhone(dto.getPhone());
    }

    public List<UserResponseDto> toListDto(List<User> users) {
        return users == null ? null : users.stream().map(this::toDto).collect(Collectors.toList());
    }
}