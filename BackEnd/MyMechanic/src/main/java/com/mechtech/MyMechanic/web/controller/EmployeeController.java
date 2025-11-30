package com.mechtech.MyMechanic.web.controller;

import com.mechtech.MyMechanic.entity.Employee;
import com.mechtech.MyMechanic.repository.projection.EmployeeProjection;
import com.mechtech.MyMechanic.service.EmployeeService;
import com.mechtech.MyMechanic.web.dto.employee.EmployeeCreateDto;
import com.mechtech.MyMechanic.web.dto.employee.EmployeeUpdateDto;
import com.mechtech.MyMechanic.web.dto.employee.EmployeeResponseDto;
import com.mechtech.MyMechanic.web.dto.pageable.PageableDto;
import com.mechtech.MyMechanic.web.mapper.EmployeeMapper;
import com.mechtech.MyMechanic.web.mapper.PageableMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import com.mechtech.MyMechanic.config.security.IsAdmin;
import com.mechtech.MyMechanic.config.security.IsAdminOrClient;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/employees")
@PreAuthorize("hasRole('ADMIN') or @securityService.isTenantMember(#id)")
public class EmployeeController {

    private final EmployeeService employeeService;
    private final EmployeeMapper employeeMapper;
    private final PageableMapper pageableMapper;


    @PostMapping
    public ResponseEntity<EmployeeResponseDto> createEmployee(@Valid @RequestBody EmployeeCreateDto dto) {
        Employee created = employeeService.create(employeeMapper.toEmployee(dto));
        return ResponseEntity.status(HttpStatus.CREATED).body(employeeMapper.toDto(created));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmployeeResponseDto> getEmployeeById(@PathVariable Long id) {
        Employee employee = employeeService.findById(id);
        return ResponseEntity.ok(employeeMapper.toDto(employee));
    }

    @GetMapping
    public ResponseEntity<PageableDto> getAllEmployees(Pageable pageable) {
        Page<EmployeeProjection> employeePage = employeeService.findAll(pageable);
        return ResponseEntity.ok(pageableMapper.toDto(employeePage));
    }


    @PutMapping("/{id}")
    public ResponseEntity<EmployeeResponseDto> updateEmployee(@PathVariable Long id,
                                                              @Valid @RequestBody EmployeeUpdateDto dto) {
        Employee employee = employeeService.findById(id);
        employeeMapper.updateEmployeeFromDto(dto, employee);
        Employee updated = employeeService.update(employee);
        return ResponseEntity.ok(employeeMapper.toDto(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEmployee(@PathVariable Long id) {
        employeeService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/cpf/{cpf}")
    public ResponseEntity<EmployeeResponseDto> findByCpf(@PathVariable String cpf) {
        Employee employee = employeeService.findByCpf(cpf);
        return ResponseEntity.ok(employeeMapper.toDto(employee));
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<EmployeeResponseDto> findByEmail(@PathVariable String email) {
        Employee employee = employeeService.findByEmail(email);
        return ResponseEntity.ok(employeeMapper.toDto(employee));
    }

    @GetMapping("/search")
    public ResponseEntity<PageableDto> search(@RequestParam(name = "q", required = false) String query, Pageable pageable) {
        Page<EmployeeProjection> employeePage = employeeService.search(query, pageable);
        return ResponseEntity.ok(pageableMapper.toDto(employeePage));
    }
}
