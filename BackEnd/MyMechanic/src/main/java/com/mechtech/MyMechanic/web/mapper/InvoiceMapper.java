package com.mechtech.MyMechanic.web.mapper;

import com.mechtech.MyMechanic.entity.Invoice;
import com.mechtech.MyMechanic.web.dto.invoice.InvoiceResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class InvoiceMapper {

    private final ClientMapper clientMapper;

    public InvoiceResponseDto toDto(Invoice invoice) {
        if (invoice == null) {
            return null;
        }

        InvoiceResponseDto dto = new InvoiceResponseDto();
        dto.setId(invoice.getId());
        dto.setInvoiceNumber(invoice.getInvoiceNumber());
        dto.setIssueDate(invoice.getIssueDate());
        dto.setTotalAmount(invoice.getTotalAmount());
        dto.setPaymentStatus(invoice.getPaymentStatus().name());
        dto.setServiceOrderId(invoice.getServiceOrder().getId());
        dto.setClient(clientMapper.toDto(invoice.getServiceOrder().getClient()));
        dto.setPaymentDate(invoice.getPaymentDate());

        return dto;
    }
}