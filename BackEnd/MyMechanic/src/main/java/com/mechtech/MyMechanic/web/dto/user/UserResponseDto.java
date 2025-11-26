package com.mechtech.MyMechanic.web.dto.user;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class UserResponseDto {

    private Long id;

    private String fullname;

    private String email;

    private String phone;

    private String role;

    private String tenantId;

    private String Status;
}
