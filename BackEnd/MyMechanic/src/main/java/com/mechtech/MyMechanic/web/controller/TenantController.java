package com.mechtech.MyMechanic.web.controller;

import com.mechtech.MyMechanic.entity.Tenant;
import com.mechtech.MyMechanic.service.TenantService;
import com.mechtech.MyMechanic.web.dto.pageable.PageableDto;
import com.mechtech.MyMechanic.web.dto.tenant.TenantResponseDto;
import com.mechtech.MyMechanic.web.dto.tenant.TenantSignupDto;
import com.mechtech.MyMechanic.web.dto.tenant.TenantUpdateDto; // Importar
import com.mechtech.MyMechanic.web.mapper.PageableMapper;
import com.mechtech.MyMechanic.web.mapper.TenantMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "Tenants", description = "Gerenciamento de Empresas")
@RestController
@RequestMapping("/api/v1/tenants")
@RequiredArgsConstructor
public class TenantController {

    private final TenantService tenantService;
    private final TenantMapper tenantMapper;
    private final PageableMapper pageableMapper;

    @Operation(summary = "Registrar nova empresa (Sign Up)")
    @PostMapping("/register")
    public ResponseEntity<TenantResponseDto> register(@Valid @RequestBody TenantSignupDto dto) {
        Tenant tenant = tenantService.registerTenant(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(tenantMapper.toDto(tenant));
    }

    @Operation(summary = "Buscar dados da empresa por ID")
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @securityService.isTenantMember(#id)")
    public ResponseEntity<TenantResponseDto> getById(@PathVariable Long id) {
        Tenant tenant = tenantService.getById(id);
        return ResponseEntity.ok(tenantMapper.toDto(tenant));
    }

    @Operation(summary = "Atualizar dados da empresa")
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @securityService.isTenantMember(#id)")
    public ResponseEntity<TenantResponseDto> update(@PathVariable Long id, @Valid @RequestBody TenantUpdateDto dto) {
        Tenant tenant = tenantService.updateTenant(id, dto);
        return ResponseEntity.ok(tenantMapper.toDto(tenant));
    }

    @Operation(summary = "Upload da Logo da Empresa")
    @PostMapping(value = "/{id}/logo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN') or @securityService.isTenantMember(#id)")
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

    @Operation(summary = "Listar todas as empresas")
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PageableDto> getAll(@PageableDefault(size = 10, sort = "name") Pageable pageable) {
        Page<Tenant> tenants = tenantService.findAll(pageable);
        return ResponseEntity.ok(pageableMapper.toDto(tenants.map(tenantMapper::toDto)));
    }
}
