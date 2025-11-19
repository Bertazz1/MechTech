package com.mechtech.MyMechanic.web.dto.client;

import lombok.*;

import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @ToString
public class ClientResponseDto {

    private Long id;
    private String name;
    private String email;
    private String phone;
    private AddressDto address;
    private String cpf;

}
