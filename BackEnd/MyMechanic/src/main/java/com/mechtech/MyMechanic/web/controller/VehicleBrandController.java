package com.mechtech.MyMechanic.web.controller;

import com.mechtech.MyMechanic.config.security.IsAdminOrClient;
import com.mechtech.MyMechanic.entity.VehicleBrand;
import com.mechtech.MyMechanic.repository.projection.PartProjection;
import com.mechtech.MyMechanic.repository.projection.VehicleBrandProjection;
import com.mechtech.MyMechanic.repository.projection.VehicleModelProjection;
import com.mechtech.MyMechanic.service.VehicleBrandService;
import com.mechtech.MyMechanic.web.dto.pageable.PageableDto;
import com.mechtech.MyMechanic.web.dto.vehicle.vehiclebrand.VehicleBrandCreateDto;
import com.mechtech.MyMechanic.web.dto.vehicle.vehiclebrand.VehicleBrandResponseDto;
import com.mechtech.MyMechanic.web.mapper.PageableMapper;
import com.mechtech.MyMechanic.web.mapper.VehicleBrandMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/vehicle-brands")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN') or @securityService.isTenantMember(#id)")
public class VehicleBrandController {

    private final VehicleBrandService vehicleBrandService;
    private final VehicleBrandMapper vehicleBrandMapper;
    private final PageableMapper pageableMapper;

    @PostMapping
    public ResponseEntity<VehicleBrandResponseDto> createVehicleBrand(@RequestBody @Valid VehicleBrandCreateDto createDto) {
        VehicleBrand vehicleBrand = vehicleBrandMapper.toVehicleBrand(createDto);
        VehicleBrand createdVehicleBrand = vehicleBrandService.createVehicleBrand(vehicleBrand);
        return ResponseEntity.status(HttpStatus.CREATED).body(vehicleBrandMapper.toDto(createdVehicleBrand));
    }

    @PutMapping("/{id}")
    public ResponseEntity<VehicleBrandResponseDto> updateVehicleBrand(@PathVariable Long id, @RequestBody @Valid VehicleBrandCreateDto updateDto) {
        VehicleBrand vehicleBrandDetails = vehicleBrandMapper.toVehicleBrand(updateDto);
        VehicleBrand updatedVehicleBrand = vehicleBrandService.updateVehicleBrand(id, vehicleBrandDetails);
        return ResponseEntity.ok(vehicleBrandMapper.toDto(updatedVehicleBrand));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVehicleBrand(@PathVariable Long id) {
        vehicleBrandService.deleteVehicleBrand(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<VehicleBrandResponseDto> getVehicleBrandById(@PathVariable Long id) {
        VehicleBrand vehicleBrand = vehicleBrandService.findById(id);
        return ResponseEntity.ok(vehicleBrandMapper.toDto(vehicleBrand));
    }

    @GetMapping
    public ResponseEntity<PageableDto> getAllVehicleBrands(Pageable pageable) {
        Page<VehicleBrandProjection> vehicleBrandsPage = vehicleBrandService.findAll(pageable);
        return ResponseEntity.ok(pageableMapper.toDto(vehicleBrandsPage));
    }

    @GetMapping("/search")
    public ResponseEntity<PageableDto> search(@RequestParam(name = "q", required = false) String query, Pageable pageable) {
        Page<VehicleBrandProjection> page = vehicleBrandService.search(query, pageable);
        return ResponseEntity.ok(pageableMapper.toDto(page));
    }






}
