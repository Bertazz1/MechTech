package com.mechtech.MyMechanic.web.controller;

import com.mechtech.MyMechanic.entity.Role;
import com.mechtech.MyMechanic.repository.projection.RoleProjection;
import com.mechtech.MyMechanic.service.RoleService;
import com.mechtech.MyMechanic.web.dto.pageable.PageableDto;
import com.mechtech.MyMechanic.web.dto.role.RoleCreateDto;
import com.mechtech.MyMechanic.web.dto.role.RoleResponseDto;
import com.mechtech.MyMechanic.web.mapper.PageableMapper;
import com.mechtech.MyMechanic.web.mapper.RoleMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/roles")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN') or @securityService.isTenantMember(#id)")
public class RoleController {

    private final RoleService roleService;
    private final RoleMapper roleMapper;
    private final PageableMapper pageableMapper;

    @PostMapping
    public ResponseEntity<RoleResponseDto> create(@Valid @RequestBody RoleCreateDto dto) {
        Role newRole = roleMapper.toRole(dto);
        Role createdRole = roleService.createRole(newRole);
        return ResponseEntity.status(HttpStatus.CREATED).body(roleMapper.toDto(createdRole));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoleResponseDto> getById(@PathVariable Long id) {
        Role role = roleService.findById(id);
        return ResponseEntity.ok(roleMapper.toDto(role));
    }

    @GetMapping
    public ResponseEntity<PageableDto> getAll(Pageable pageable) {
        Page<RoleProjection> page = roleService.findAll(pageable);
        return ResponseEntity.ok(pageableMapper.toDto(page));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RoleResponseDto> update(@PathVariable Long id, @Valid @RequestBody RoleCreateDto dto) {
        Role roleDetails = roleMapper.toRole(dto);
        Role updatedRole = roleService.updateRole(id, roleDetails);
        return ResponseEntity.ok(roleMapper.toDto(updatedRole));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        roleService.deleteRole(id);
        return ResponseEntity.noContent().build();
    }
    @GetMapping("/search")
    public ResponseEntity<PageableDto> search(@RequestParam(name = "q") String query, Pageable pageable) {
        Page<RoleProjection> page = roleService.search(query, pageable);
        return ResponseEntity.ok(pageableMapper.toDto(page));
    }
}
