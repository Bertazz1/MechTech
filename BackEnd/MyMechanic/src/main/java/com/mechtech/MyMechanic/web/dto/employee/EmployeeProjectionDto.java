package com.mechtech.MyMechanic.web.dto.employee;

import com.mechtech.MyMechanic.entity.Address;
import com.mechtech.MyMechanic.web.dto.client.AddressDto;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EmployeeProjectionDto {
    Long id;
    String name;
    String role;
    String email;
    String phone;
    AddressDto address;
}
