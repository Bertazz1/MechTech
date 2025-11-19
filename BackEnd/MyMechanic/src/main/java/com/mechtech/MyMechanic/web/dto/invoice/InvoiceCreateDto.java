package com.mechtech.MyMechanic.web.dto.invoice;


import com.mechtech.MyMechanic.entity.ServiceOrder;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;


import java.math.BigDecimal;
import java.time.LocalDateTime;

public class InvoiceCreateDto {

    @NotBlank
    private String invoiceNumber;

    @NotBlank
    private LocalDateTime issueDate;

    @NotNull
    private BigDecimal totalAmount;


    private String paymentStatus;

    @NotNull
    private ServiceOrder serviceOrder;

}
