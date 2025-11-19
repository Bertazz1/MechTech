package com.mechtech.MyMechanic.web.dto.part;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class PartUpdateDto {
    @NotBlank
    @Size(max = 100)
    private String name;

    @NotNull
    private BigDecimal price;

    @Size(max = 500)
    private String description;

    @Size(max = 100)
    private String code;

    @Size(max = 100)
    private String supplier;

}
