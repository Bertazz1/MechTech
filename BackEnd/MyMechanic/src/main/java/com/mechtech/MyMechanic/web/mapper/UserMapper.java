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
        user.setFirstName(userCreateDTO.getFirstName());
        user.setLastName(userCreateDTO.getLastName());
        user.setEmail(userCreateDTO.getEmail());
        user.setPhone(userCreateDTO.getPhone());
        user.setTenantId(userCreateDTO.getTenantId());
        user.setRole(User.Role.valueOf(userCreateDTO.getRole()));
        return user;
    }

    public UserResponseDto toDto(User user) {
        if (user == null) {
            return null;
        }
        UserResponseDto dto = new UserResponseDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setRole(user.getRole().name());
        dto.setTenantId(user.getTenantId());
        dto.setStatus(user.getStatus().name());
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