package com.mechtech.MyMechanic.web.controller;

import com.mechtech.MyMechanic.entity.Vehicle;
import com.mechtech.MyMechanic.repository.projection.VehicleProjection;
import com.mechtech.MyMechanic.service.VehicleService;
import com.mechtech.MyMechanic.web.dto.pageable.PageableDto;
import com.mechtech.MyMechanic.web.dto.vehicle.VehicleCreateDto;
import com.mechtech.MyMechanic.web.dto.vehicle.VehicleResponseDto;
import com.mechtech.MyMechanic.web.dto.vehicle.VehicleUpdateDto;
import com.mechtech.MyMechanic.web.mapper.PageableMapper;
import com.mechtech.MyMechanic.web.mapper.VehicleMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/vehicles")
public class VehicleController {

    private final VehicleService vehicleService;
    private final VehicleMapper vehicleMapper;
    private final PageableMapper pageableMapper;

    @PostMapping
    public ResponseEntity<VehicleResponseDto> createVehicle(@Valid @RequestBody VehicleCreateDto vehicleCreateDto) {
        Vehicle savedVehicle = vehicleService.createVehicle(vehicleCreateDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(vehicleMapper.toDto(savedVehicle));
    }

    @GetMapping("/{id}")
    public ResponseEntity<VehicleResponseDto> getById(@Valid @PathVariable Long id) {
        Vehicle savedVehicle = vehicleService.findById(id);
        return ResponseEntity.ok(vehicleMapper.toDto(savedVehicle));
    }

    @GetMapping()
    public ResponseEntity<PageableDto> getAllVehicles(Pageable pageable) {
        Page<VehicleProjection> page = vehicleService.findAll(pageable);
        return ResponseEntity.ok(pageableMapper.toDto(page));
    }

    @GetMapping("/by-client")
    public ResponseEntity<PageableDto> getVehiclesByClientId(@RequestParam Long clientId, Pageable pageable) {
        Page<VehicleProjection> vehicles = vehicleService.findByClientId(clientId, pageable);
        return ResponseEntity.ok(pageableMapper.toDto(vehicles));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVehicle(@PathVariable Long id) {
        vehicleService.deleteVehicle(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<VehicleResponseDto> updateVehicle(@PathVariable Long id, @Valid @RequestBody VehicleUpdateDto vehicleUpdateDto) {
        Vehicle vehicleToUpdate = vehicleService.findById(id);
        vehicleMapper.updateVehicleFromDto(vehicleUpdateDto, vehicleToUpdate);
        Vehicle updatedVehicle = vehicleService.updateVehicle(vehicleToUpdate);
        return ResponseEntity.ok(vehicleMapper.toDto(updatedVehicle));
    }

    @GetMapping("/search")
    public ResponseEntity<PageableDto> search(@RequestParam(name = "q", required = false) String query, Pageable pageable) {
        Page<VehicleProjection> vehiclePage = vehicleService.search(query, pageable);
        return ResponseEntity.ok(pageableMapper.toDto(vehiclePage));
    }
}
