package com.mechtech.MyMechanic.web.controller;

import com.mechtech.MyMechanic.service.ReportService;
import com.mechtech.MyMechanic.web.dto.report.CommissionReportDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@Tag(name = "Relatórios", description = "Relatórios gerenciais")
@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @Operation(summary = "Relatório de Comissões por Período")
    @GetMapping("/commissions")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CommissionReportDto>> getCommissions(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(reportService.getCommissionReport(startDate, endDate));
    }
}