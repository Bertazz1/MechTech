package com.mechtech.MyMechanic.web.controller;

import com.mechtech.MyMechanic.config.security.IsAdminOrClient;
import com.mechtech.MyMechanic.entity.Invoice;
import com.mechtech.MyMechanic.repository.projection.InvoiceProjection;
import com.mechtech.MyMechanic.service.InvoiceService;
import com.mechtech.MyMechanic.web.dto.invoice.InvoiceResponseDto;
import com.mechtech.MyMechanic.web.dto.invoice.InvoiceUpdatePaymentDto;
import com.mechtech.MyMechanic.web.dto.pageable.PageableDto;
import com.mechtech.MyMechanic.web.mapper.InvoiceMapper;
import com.mechtech.MyMechanic.web.mapper.PageableMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/invoices")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN') or @securityService.isTenantMember(#id)")
public class InvoiceController {

    private final InvoiceService invoiceService;
    private final InvoiceMapper invoiceMapper;
    private final PageableMapper pageableMapper;

    @PostMapping("/from-service-order/{serviceOrderId}")
    public ResponseEntity<InvoiceResponseDto> createFromServiceOrder(@PathVariable Long serviceOrderId) {
        Invoice invoice = invoiceService.createFromServiceOrder(serviceOrderId);
        return ResponseEntity.status(HttpStatus.CREATED).body(invoiceMapper.toDto(invoice));
    }

    @GetMapping
    public ResponseEntity<PageableDto> getAll(Pageable pageable) {
        Page<InvoiceProjection> page = invoiceService.findAll(pageable);
        return ResponseEntity.ok(pageableMapper.toDto(page));
    }

    @GetMapping("/search")
    public ResponseEntity<PageableDto> search(@RequestParam(name = "q") String query, Pageable pageable) {
        Page<InvoiceProjection> invoicePage = invoiceService.search(query, pageable);
        return ResponseEntity.ok(pageableMapper.toDto(invoicePage));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<InvoiceResponseDto> updatePaymentStatus(@PathVariable Long id, @Valid @RequestBody InvoiceUpdatePaymentDto dto) {
        Invoice updatedInvoice = invoiceService.updatePaymentStatus(id, dto.getPaymentStatus());
        return ResponseEntity.ok(invoiceMapper.toDto(updatedInvoice));
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> getInvoicePdf(@PathVariable Long id) {
        byte[] pdfContents = invoiceService.getInvoiceAsPdf(id);

        String filename = "fatura-" + id + ".pdf";

        return ResponseEntity.ok()
                .header("Content-Type", "application/pdf")
                .header("Content-Disposition", "inline; filename=\"" + filename + "\"")
                .body(pdfContents);
    }
}
