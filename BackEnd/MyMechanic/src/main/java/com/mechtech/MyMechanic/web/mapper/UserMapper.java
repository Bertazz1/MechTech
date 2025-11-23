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

    public User toUser(UserCreateDto userCreateDTO) {
        if (userCreateDTO == null) {
            return null;
        }
        User user = new User();
        user.setUsername(userCreateDTO.getUsername());
        user.setPassword(userCreateDTO.getPassword());
        if (userCreateDTO.getFirstName() != null) {
            user.setFirstName(userCreateDTO.getFirstName());
        }
        if (userCreateDTO.getLastName() != null) {
            user.setLastName(userCreateDTO.getLastName());
        }
        user.setEmail(userCreateDTO.getEmail());
        if (userCreateDTO.getPhone() != null) {
            user.setPhone(userCreateDTO.getPhone());
        }
        user.setTenantId(userCreateDTO.getTenantId());
        if (userCreateDTO.getRole() != null) {
            user.setRole(User.Role.valueOf(userCreateDTO.getRole()));
        } else {
            user.setRole(User.Role.ROLE_CLIENT);
        }
        return user;
    }

    public UserResponseDto toDto(User user) {
        if (user == null) {
            return null;
        }
        UserResponseDto dto = new UserResponseDto();
        dto.setId(user.getId());
        if (user.getUsername() != null) {
            dto.setUsername(user.getUsername());
        }
        if (user.getFirstName() != null) {
            dto.setFirstName(user.getFirstName());
        }
        if (user.getLastName() != null) {
            dto.setLastName(user.getLastName());
        }
        if (user.getEmail() != null) {
            dto.setEmail(user.getEmail());
        }
        if (user.getPhone() != null) {
            dto.setPhone(user.getPhone());
        }
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
        if (dto == null || user == null) {
            return;
        }
        if (dto.getFirstName() != null) {
            user.setFirstName(dto.getFirstName());
        }
        if (dto.getLastName() != null) {
            user.setLastName(dto.getLastName());
        }
        if (dto.getEmail() != null) {
            user.setEmail(dto.getEmail());
        }
        if (dto.getPhone() != null) {
            user.setPhone(dto.getPhone());
        }
    }

    public List<UserResponseDto> toListDto(List<User> users) {
        if (users == null) {
            return null;
        }
        return users.stream().map(this::toDto).collect(Collectors.toList());
    }
}