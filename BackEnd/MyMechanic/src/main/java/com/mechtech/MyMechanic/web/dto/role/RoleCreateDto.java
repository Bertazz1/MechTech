package com.mechtech.MyMechanic.web.dto.role;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.Getter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public  class RoleCreateDto {
    @NotBlank(message = "O nome da função é obrigatório")
    private String name;

    @NotNull(message = "O campo 'receivesCommission' é obrigatório")
    private Boolean receivesCommission;
}


