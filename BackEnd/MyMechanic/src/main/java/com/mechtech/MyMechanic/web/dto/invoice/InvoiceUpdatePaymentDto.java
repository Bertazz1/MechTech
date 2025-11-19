package com.mechtech.MyMechanic.web.dto.invoice;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InvoiceUpdatePaymentDto {

    @NotBlank(message = "O status do pagamento não pode ser vazio.")
    private String paymentStatus;
}