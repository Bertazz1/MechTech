package com.mechtech.MyMechanic.web.controller;

import com.mechtech.MyMechanic.entity.Tenant;
import com.mechtech.MyMechanic.service.TenantService;
import com.mechtech.MyMechanic.web.dto.tenant.TenantResponseDto;
import com.mechtech.MyMechanic.web.dto.tenant.TenantSignupDto;
import com.mechtech.MyMechanic.web.mapper.TenantMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "Tenants (Empresas)", description = "Gerenciamento de Empresas")
@RestController
@RequestMapping("/api/v1/tenants")
@RequiredArgsConstructor
public class TenantController {

    private final TenantService tenantService;
    private final TenantMapper tenantMapper;

    @Operation(summary = "Registrar nova empresa (Sign Up)")
    @PostMapping("/register")
    public ResponseEntity<TenantResponseDto> register(@Valid @RequestBody TenantSignupDto dto) {
        Tenant tenant = tenantService.registerTenant(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(tenantMapper.toDto(tenant));
    }

    @Operation(summary = "Upload da Logo da Empresa")
    @PostMapping(value = "/{id}/logo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> uploadLogo(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        tenantService.updateLogo(id, file);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Visualizar Logo")
    @GetMapping("/{id}/logo")
    public ResponseEntity<byte[]> getLogo(@PathVariable Long id) {
        byte[] logo = tenantService.getLogo(id);
        String contentType = tenantService.getLogoContentType(id);

        if (logo == null || logo.length == 0) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType != null ? contentType : "image/png"))
                .body(logo);
    }
}