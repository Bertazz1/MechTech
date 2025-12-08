package com.mechtech.MyMechanic.web.controller;

import com.mechtech.MyMechanic.entity.VehicleBrand;
import com.mechtech.MyMechanic.entity.VehicleModel;
import com.mechtech.MyMechanic.repository.VehicleBrandRepository;
import com.mechtech.MyMechanic.repository.projection.PartProjection;
import com.mechtech.MyMechanic.repository.projection.VehicleModelProjection;
import com.mechtech.MyMechanic.service.VehicleModelService;
import com.mechtech.MyMechanic.web.dto.pageable.PageableDto;
import com.mechtech.MyMechanic.web.dto.vehicle.vehiclemodel.VehicleModelCreateDto;
import com.mechtech.MyMechanic.web.dto.vehicle.vehiclemodel.VehicleModelResponseDto;
import com.mechtech.MyMechanic.web.mapper.PageableMapper;
import com.mechtech.MyMechanic.web.mapper.VehicleModelMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.projection.ProjectionFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/vehicle-models")
@RequiredArgsConstructor
public class VehicleModelController {

    private final VehicleModelService vehicleModelService;
    private final VehicleModelMapper vehicleModelMapper;
    private final PageableMapper pageableMapper;

    @PostMapping
    public ResponseEntity<VehicleModelResponseDto> create(@Valid @RequestBody VehicleModelCreateDto dto) {
        VehicleModel newModel = vehicleModelMapper.toVehicleModel(dto);
        VehicleModel createdModel = vehicleModelService.createVehicleModel(newModel);
        return ResponseEntity.status(HttpStatus.CREATED).body(vehicleModelMapper.toDto(createdModel));
    }

    @GetMapping("/{id}")
    public ResponseEntity<VehicleModelResponseDto> getById(@PathVariable Long id) {
        VehicleModel model = vehicleModelService.findById(id);
        return ResponseEntity.ok(vehicleModelMapper.toDto(model));
    }

    @GetMapping
    public ResponseEntity<PageableDto> getAll(Pageable pageable) {
        Page<VehicleModelProjection> page = vehicleModelService.findAll(pageable);
        return ResponseEntity.ok(pageableMapper.toDto( page));
    }

    @PutMapping("/{id}")
    public ResponseEntity<VehicleModelResponseDto> update(@PathVariable Long id, @Valid @RequestBody VehicleModelCreateDto dto) {
        VehicleModel modelDetails = vehicleModelMapper.toVehicleModel(dto);
        VehicleModel updatedModel = vehicleModelService.updateVehicleModel(id, modelDetails);
        return ResponseEntity.ok(vehicleModelMapper.toDto(updatedModel));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        vehicleModelService.deleteVehicleModel(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<PageableDto> search(@RequestParam(name = "q", required = false) String query, Pageable pageable) {
        Page<VehicleModelProjection> page = vehicleModelService.search(query, pageable);
        return ResponseEntity.ok(pageableMapper.toDto(page));
    }
}
