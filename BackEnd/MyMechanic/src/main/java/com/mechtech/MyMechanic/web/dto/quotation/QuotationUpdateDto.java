package com.mechtech.MyMechanic.web.dto.quotation;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @ToString
public class QuotationUpdateDto {

    @Size(max = 300)
    private String description;

    private String status;

    private LocalDateTime entryTime;

    @Valid
    private Set<QuotationPartItemDto> partItems;

    @Valid
    private Set<QuotationServiceItemDto> serviceItems;



}
