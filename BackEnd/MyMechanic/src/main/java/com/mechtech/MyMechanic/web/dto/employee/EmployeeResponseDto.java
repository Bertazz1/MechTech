package com.mechtech.MyMechanic.web.dto.employee;

import com.mechtech.MyMechanic.web.dto.client.AddressDto;
import com.mechtech.MyMechanic.web.dto.role.RoleResponseDto;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.Set;

@Getter
@Setter
public class EmployeeResponseDto {

    private Long id;
    private  String name;
    private  String cpf;
    private String email;
    private String phone;

    private AddressDto address;
    private RoleResponseDto role;


}

