package com.mechtech.MyMechanic.web.mapper;

import com.mechtech.MyMechanic.entity.Employee;
import com.mechtech.MyMechanic.entity.ServiceOrder;
import com.mechtech.MyMechanic.entity.ServiceOrderEmployee;
import com.mechtech.MyMechanic.repository.projection.EmployeeProjection;
import com.mechtech.MyMechanic.web.dto.employee.EmployeeCreateDto;
import com.mechtech.MyMechanic.web.dto.employee.EmployeeProjectionDto;
import com.mechtech.MyMechanic.web.dto.employee.EmployeeResponseDto;
import com.mechtech.MyMechanic.web.dto.employee.EmployeeUpdateDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class EmployeeMapper {

    private final AddressMapper addressMapper;

    public Employee toEmployee(EmployeeCreateDto dto) {
        if (dto == null) {
            return null;
        }
        Employee employee = new Employee();
        employee.setName(dto.getName());
        employee.setRole(dto.getRole());
        employee.setCpf(dto.getCpf());
        employee.setEmail(dto.getEmail());
        employee.setPhone(dto.getPhone());
        if (dto.getAddress() != null) {
            employee.setAddress(addressMapper.toAddress(dto.getAddress()));
        }

        return employee;
    }

    public EmployeeResponseDto toDto(Employee employee) {
        if (employee == null) {
            return null;
        }
        EmployeeResponseDto dto = new EmployeeResponseDto();
        dto.setId(employee.getId());
        dto.setName(employee.getName());
        dto.setRole(employee.getRole());
        dto.setCpf(employee.getCpf());
        dto.setEmail(employee.getEmail());
        dto.setPhone(employee.getPhone());
        if (employee.getAddress() != null) {
            dto.setAddress(addressMapper.toDto(employee.getAddress()));
        }
        return dto;
    }

    public void updateEmployeeFromDto(EmployeeUpdateDto dto, Employee employee) {
        if (dto == null || employee == null) {
            return;
        }
        if (dto.getName() != null) {
            employee.setName(dto.getName());
        }
        if (dto.getRole() != null) {
            employee.setRole(dto.getRole());
        }
        if (dto.getPhone() != null) {
            employee.setPhone(dto.getPhone());
        }
        if (dto.getEmail() != null) {
            employee.setEmail(dto.getEmail());
        }
        if (dto.getCpf() != null) {
            employee.setCpf(dto.getCpf());
        }
        if (dto.getAddress() != null) {
            if (employee.getAddress() == null) {
                employee.setAddress(new AddressMapper().toAddress(dto.getAddress()));
            } else {
                addressMapper.updateFromDto(dto.getAddress(), employee.getAddress());
            }
        }
    }

    public List<EmployeeResponseDto> toListDto(List<Employee> employees) {
        if (employees == null) {
            return null;
        }
        return employees.stream().map(this::toDto).collect(Collectors.toList());
    }

    public EmployeeProjectionDto toProjectionDto(EmployeeProjection employee) {
        if (employee == null) {
            return null;
        }
        EmployeeProjectionDto dto = new EmployeeProjectionDto();
        dto.setId(employee.getId());
        dto.setName(employee.getName());
        dto.setRole(employee.getRole());
        dto.setEmail(employee.getEmail());
        dto.setPhone(employee.getPhone());
        if (employee.getAddress() != null) {
            dto.setAddress(addressMapper.toDto(employee.getAddress()));
        }
        return dto;
    }
}