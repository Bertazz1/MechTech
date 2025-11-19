package com.mechtech.MyMechanic.web.controller;

import com.mechtech.MyMechanic.config.security.IsAdmin;
import com.mechtech.MyMechanic.config.security.IsAdminOrClient;
import com.mechtech.MyMechanic.entity.RepairService;
import com.mechtech.MyMechanic.repository.projection.RepairServiceProjection;
import com.mechtech.MyMechanic.service.RepairServiceService;
import com.mechtech.MyMechanic.web.dto.pageable.PageableDto;
import com.mechtech.MyMechanic.web.dto.repairservice.RepairServiceCreateDto;
import com.mechtech.MyMechanic.web.dto.repairservice.RepairServiceResponseDto;
import com.mechtech.MyMechanic.web.mapper.PageableMapper;
import com.mechtech.MyMechanic.web.mapper.RepairServiceMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/repair-services")
@RequiredArgsConstructor
public class RepairServiceController {

    private final RepairServiceService repairServiceService;
    private final RepairServiceMapper repairServiceMapper;
    private final PageableMapper pageableMapper;

    @IsAdminOrClient
    @PostMapping
    public ResponseEntity<RepairServiceResponseDto> create(@Valid @RequestBody RepairServiceCreateDto createDto) {
        RepairService newService = repairServiceMapper.toRepairService(createDto);
        RepairService createdService = repairServiceService.create(newService);
        return ResponseEntity.status(HttpStatus.CREATED).body(repairServiceMapper.toDto(createdService));
    }

    @IsAdminOrClient
    @GetMapping("/{id}")
    public ResponseEntity<RepairServiceResponseDto> getById(@PathVariable Long id) {
        RepairService service = repairServiceService.findById(id);
        return ResponseEntity.ok(repairServiceMapper.toDto(service));
    }

    @IsAdminOrClient
    @GetMapping
    public ResponseEntity<PageableDto> getAll(Pageable pageable) {
        Page<RepairServiceProjection> servicePage = repairServiceService.findAll(pageable);
        return ResponseEntity.ok(pageableMapper.toDto(servicePage));
    }

    @IsAdminOrClient
    @GetMapping("/search/by-name")
    public ResponseEntity<PageableDto> findByName(@RequestParam String name,Pageable pageable) {
        Page<RepairServiceProjection> servicePage = repairServiceService.findByName(name,pageable);
        return ResponseEntity.ok(pageableMapper.toDto(servicePage));
    }


    @IsAdminOrClient
    @PutMapping("/{id}")
    public ResponseEntity<RepairServiceResponseDto> update(@PathVariable Long id, @Valid @RequestBody RepairServiceCreateDto updateDto) {
        RepairService existingService = repairServiceService.findById(id);
        repairServiceMapper.updateFromDto(updateDto, existingService);
        RepairService updatedService = repairServiceService.update(id, existingService);
        return ResponseEntity.ok(repairServiceMapper.toDto(updatedService));
    }

    @IsAdminOrClient
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        repairServiceService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @IsAdminOrClient
    @GetMapping("/search")
    public ResponseEntity<PageableDto> search(@RequestParam(name = "q", required = false) String query, Pageable pageable) {
        Page<RepairService> servicePage = repairServiceService.search(query, pageable);
        Page<RepairServiceResponseDto> dtoPage = servicePage.map(repairServiceMapper::toDto);
        return ResponseEntity.ok(pageableMapper.toDto(dtoPage));
    }
}