package com.mechtech.MyMechanic.web.controller;

import com.mechtech.MyMechanic.config.security.IsAdminOrClient;
import com.mechtech.MyMechanic.entity.Quotation;
import com.mechtech.MyMechanic.repository.projection.QuotationProjection;
import com.mechtech.MyMechanic.service.QuotationService;
import com.mechtech.MyMechanic.web.dto.pageable.PageableDto;
import com.mechtech.MyMechanic.web.dto.quotation.QuotationCreateDto;
import com.mechtech.MyMechanic.web.dto.quotation.QuotationUpdateDto;
import com.mechtech.MyMechanic.web.mapper.PageableMapper;
import com.mechtech.MyMechanic.web.mapper.QuotationMapper;
import com.mechtech.MyMechanic.web.dto.quotation.QuotationResponseDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/quotations")
@PreAuthorize("hasRole('ADMIN') or @securityService.isTenantMember(#id)")
public class QuotationController {
    private final QuotationService quotationService;
    private final QuotationMapper quotationMapper;
    private final PageableMapper pageableMapper;

    @PostMapping
    public ResponseEntity<QuotationResponseDto> createQuotation(@Valid @RequestBody QuotationCreateDto quotationCreateDto) {
        Quotation quotation = quotationMapper.toQuotation(quotationCreateDto);
        Quotation savedQuotation = quotationService.createQuotation(
                quotation,
                quotationCreateDto.getVehicleId(),
                quotationCreateDto.getPartItems(),
                quotationCreateDto.getServiceItems()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(quotationMapper.toDto(savedQuotation));
    }

    @GetMapping("/{id}")
    public ResponseEntity<QuotationResponseDto> findById(@Valid @PathVariable Long id) {
        Quotation savedQuotation = quotationService.findById(id);
        return ResponseEntity.ok(quotationMapper.toDto(savedQuotation));
    }

    @GetMapping
    public ResponseEntity<PageableDto> getAllQuotations(Pageable pageable) {
        Page<QuotationProjection> page = quotationService.findAll(pageable);
        return ResponseEntity.ok(pageableMapper.toDto(page));
    }

    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<List<QuotationResponseDto>> getQuotationsByVehicleId(@PathVariable Long vehicleId) {
        List<Quotation> quotations = quotationService.findByVehicleId(vehicleId);
        return ResponseEntity.ok(quotationMapper.toListDto(quotations));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuotation(@PathVariable Long id) {
        Quotation deleted = quotationService.findById(id);
        quotationService.delete(deleted);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<QuotationResponseDto> updateQuotation(@PathVariable Long id,
                                                                @Valid @RequestBody QuotationUpdateDto dto) {
        Quotation updated = quotationService.update(id, dto);
        return ResponseEntity.ok(quotationMapper.toDto(updated));
    }

    @GetMapping("/search")
    public ResponseEntity<PageableDto> search(@RequestParam(name = "q", required = false) String query, Pageable pageable) {
        Page<QuotationProjection> quotationPage = quotationService.search(query, pageable);
        return ResponseEntity.ok(pageableMapper.toDto(quotationPage));
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> getQuotationPdf(@PathVariable Long id) {
        byte[] pdfContents = quotationService.getQuotationAsPdf(id);

        String filename = "Orçamento-" + id + ".pdf";

        return ResponseEntity.ok()
                .header("Content-Type", "application/pdf")
                .header("Content-Disposition", "inline; filename=\"" + filename + "\"")
                .body(pdfContents);
    }
}
