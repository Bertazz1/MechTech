package com.mechtech.MyMechanic.web.controller;

import com.mechtech.MyMechanic.config.security.IsAdminOrClient;
import com.mechtech.MyMechanic.entity.ServiceOrder;
import com.mechtech.MyMechanic.repository.projection.ServiceOrderProjection;
import com.mechtech.MyMechanic.service.ServiceOrderService;
import com.mechtech.MyMechanic.web.dto.pageable.PageableDto;
import com.mechtech.MyMechanic.web.dto.serviceorder.ServiceOrderCreateDto;
import com.mechtech.MyMechanic.web.dto.serviceorder.ServiceOrderResponseDto;
import com.mechtech.MyMechanic.web.dto.serviceorder.ServiceOrderUpdateDto;
import com.mechtech.MyMechanic.web.mapper.PageableMapper;
import com.mechtech.MyMechanic.web.mapper.ServiceOrderMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/service-orders")
@RequiredArgsConstructor
public class ServiceOrderController {

    private final ServiceOrderService serviceOrderService;
    private final ServiceOrderMapper serviceOrderMapper;
    private final PageableMapper pageableMapper;

    @IsAdminOrClient
    @PostMapping("/from-quotation/{quotationId}")
    public ResponseEntity<ServiceOrderResponseDto> createFromQuotation(@PathVariable Long quotationId) {
        ServiceOrder serviceOrder = serviceOrderService.createFromQuotation(quotationId);
        return ResponseEntity.status(HttpStatus.CREATED).body(serviceOrderMapper.toDto(serviceOrder));
    }

    @IsAdminOrClient
    @PostMapping
    public ResponseEntity<ServiceOrderResponseDto> createDirect(@Valid @RequestBody ServiceOrderCreateDto dto) {
        ServiceOrder serviceOrder = serviceOrderService.createDirect(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(serviceOrderMapper.toDto(serviceOrder));
    }

    @IsAdminOrClient
    @GetMapping("/{id}")
    public ResponseEntity<ServiceOrderResponseDto> getById(@PathVariable Long id) {
        ServiceOrder serviceOrder = serviceOrderService.findById(id);
        return ResponseEntity.ok(serviceOrderMapper.toDto(serviceOrder));
    }


    @IsAdminOrClient
    @GetMapping
    public ResponseEntity<PageableDto> getAll(Pageable pageable) {
        Page<ServiceOrderProjection> page = serviceOrderService.findAll(pageable);
        return ResponseEntity.ok(pageableMapper.toDto(page));
    }


    @IsAdminOrClient
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        serviceOrderService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @IsAdminOrClient
    @GetMapping("/search")
    public ResponseEntity<PageableDto> search(@RequestParam(name = "q", required = false) String query, Pageable pageable) {
        Page<ServiceOrderProjection> serviceOrderPage = serviceOrderService.search(query, pageable);
        return ResponseEntity.ok(pageableMapper.toDto(serviceOrderPage));
    }

    @PatchMapping("/{id}")
    @IsAdminOrClient
    public ResponseEntity<ServiceOrderResponseDto> updateServiceOrder(@PathVariable Long id, @Valid @RequestBody ServiceOrderUpdateDto dto) { // Mudar para @PathVariable e @RequestBody
        ServiceOrder updatedServiceOrder = serviceOrderService.update(id, dto);
        return ResponseEntity.ok(serviceOrderMapper.toDto(updatedServiceOrder));
    }

    @IsAdminOrClient
    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> getServiceOrderPdf(@PathVariable Long id) {
        byte[] pdfContents = serviceOrderService.getServiceOrderAsPdf(id);

        String filename = "ordem-servico-" + id + ".pdf";

        return ResponseEntity.ok()
                .header("Content-Type", "application/pdf")
                .header("Content-Disposition", "inline; filename=\"" + filename + "\"")
                .body(pdfContents);
    }
}