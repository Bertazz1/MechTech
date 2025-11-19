package com.mechtech.MyMechanic.web.dto.part;

import java.math.BigDecimal;
import java.util.List;

import com.mechtech.MyMechanic.entity.Quotation;
import com.mechtech.MyMechanic.entity.ServiceOrder;
import lombok.*;

@AllArgsConstructor
@Getter
@NoArgsConstructor
@Setter
public class PartResponseDto {

    private Long id;
    private String name;
    private String description;
    private String code;
    private BigDecimal price;
    private String supplier;


}

