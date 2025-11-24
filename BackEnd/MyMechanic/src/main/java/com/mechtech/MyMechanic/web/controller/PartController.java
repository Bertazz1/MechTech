package com.mechtech.MyMechanic.web.controller;

import com.mechtech.MyMechanic.config.security.IsAdminOrClient;
import com.mechtech.MyMechanic.entity.Part;
import com.mechtech.MyMechanic.web.dto.pageable.PageableDto;
import com.mechtech.MyMechanic.web.mapper.PageableMapper;
import com.mechtech.MyMechanic.web.mapper.PartMapper;
import com.mechtech.MyMechanic.repository.projection.PartProjection;
import com.mechtech.MyMechanic.service.PartService;
import com.mechtech.MyMechanic.web.dto.part.PartCreateDto;
import com.mechtech.MyMechanic.web.dto.part.PartResponseDto;
import com.mechtech.MyMechanic.web.dto.part.PartUpdateDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/parts")
@RequiredArgsConstructor
public class PartController {

    private final PartService partService;
    private final PartMapper partMapper;
    private final PageableMapper pageableMapper;

    @IsAdminOrClient
    @PostMapping
    public ResponseEntity<PartResponseDto> create(@Valid @RequestBody PartCreateDto dto) {
        Part part = partMapper.toPart(dto);
        Part created = partService.createPart(part);
        return ResponseEntity.ok(partMapper.toDto(created));
    }

    @IsAdminOrClient
    @GetMapping("/{id}")
    public ResponseEntity<PartResponseDto> findById(@PathVariable Long id) {
        Part part = partService.findById(id);
        return ResponseEntity.ok(partMapper.toDto(part));
    }

    @IsAdminOrClient
    @GetMapping("/code/{code}")
    public ResponseEntity<PartResponseDto> findByCode(@PathVariable String code) {
        Part part = partService.findByCode(code);
        return ResponseEntity.ok(partMapper.toDto(part));
    }

    @IsAdminOrClient
    @GetMapping
    public ResponseEntity<PageableDto> findAll(Pageable pageable) {
        Page<PartProjection> partsPage = partService.findAll(pageable);
        return ResponseEntity.ok(pageableMapper.toDto(partsPage));
    }

    @IsAdminOrClient
    @PutMapping("/{id}")
    public ResponseEntity<PartResponseDto> update(@PathVariable Long id,
                                                  @Valid @RequestBody PartUpdateDto dto) {
        Part part = partService.findById(id);
        partMapper.updatePartFromDto(dto, part);
        Part updatedPart = partService.updatePart(id, part);
        return ResponseEntity.ok(partMapper.toDto(updatedPart));

    }

    @IsAdminOrClient
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        Part part = partService.findById(id);
        partService.delete(part);
        return ResponseEntity.noContent().build();
    }

    @IsAdminOrClient
    @GetMapping("/search")
    public ResponseEntity<PageableDto> search(@RequestParam(name = "q", required = false) String query, Pageable pageable) {
        Page<PartProjection> partsPage = partService.search(query, pageable);
        return ResponseEntity.ok(pageableMapper.toDto(partsPage));
    }
}
