package com.mechtech.MyMechanic.web.dto.invoice;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.mechtech.MyMechanic.web.dto.client.ClientResponseDto;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class InvoiceResponseDto {
    private Long id;
    private String invoiceNumber;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime issueDate;
    private BigDecimal totalAmount;
    private String paymentStatus;
    private Long serviceOrderId;
    private ClientResponseDto client;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime paymentDate;
}