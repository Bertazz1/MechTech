package com.mechtech.MyMechanic.web.dto.client;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ClientProjectionDto {

    private Long id;
    private String name;
    private String email;
    private String phone;
    private String cpf;
    private AddressDto address;

}