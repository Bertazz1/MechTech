package com.mechtech.MyMechanic.web.controller;

import com.mechtech.MyMechanic.entity.Employee;
import com.mechtech.MyMechanic.repository.projection.EmployeeProjection;
import com.mechtech.MyMechanic.service.EmployeeService;
import com.mechtech.MyMechanic.web.dto.employee.EmployeeCreateDto;
import com.mechtech.MyMechanic.web.dto.employee.EmployeeProjectionDto;
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
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/employees")
public class EmployeeController {

    private final EmployeeService employeeService;
    private final EmployeeMapper employeeMapper;
    private final PageableMapper pageableMapper;


    @PostMapping
    @IsAdminOrClient
    public ResponseEntity<EmployeeResponseDto> createEmployee(@Valid @RequestBody EmployeeCreateDto dto) {
        Employee created = employeeService.create(employeeMapper.toEmployee(dto));
        return ResponseEntity.status(HttpStatus.CREATED).body(employeeMapper.toDto(created));
    }

    @GetMapping("/{id}")
    @IsAdminOrClient
    public ResponseEntity<EmployeeResponseDto> getEmployeeById(@PathVariable Long id) {
        Employee employee = employeeService.findById(id);
        return ResponseEntity.ok(employeeMapper.toDto(employee));
    }

    @GetMapping
    @IsAdminOrClient
    public ResponseEntity<PageableDto> getAllEmployees(Pageable pageable) {
        Page<EmployeeProjection> employeePage = employeeService.findAll(pageable);
        Page<EmployeeProjectionDto> dtoPage = employeePage.map(employeeMapper::toProjectionDto);
        return ResponseEntity.ok(pageableMapper.toDto(dtoPage));
    }

    @IsAdminOrClient
    @PutMapping("/{id}")
    public ResponseEntity<EmployeeResponseDto> updateEmployee(@PathVariable Long id,
                                                              @Valid @RequestBody EmployeeUpdateDto dto) {
        Employee employee = employeeService.findById(id);
        employeeMapper.updateEmployeeFromDto(dto, employee);
        Employee updated = employeeService.update(id, employee);
        return ResponseEntity.ok(employeeMapper.toDto(updated));
    }

    @IsAdminOrClient
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEmployee(@PathVariable Long id) {
        Employee employee = employeeService.findById(id);
        employeeService.delete(employee);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search/by-name")
    @IsAdminOrClient
    public ResponseEntity<PageableDto> findByName(@RequestParam String name, Pageable pageable) {
        Page<EmployeeProjection> employeePage = employeeService.findAllByName(name, pageable);
        Page<EmployeeProjectionDto> dtoPage = employeePage.map(employeeMapper::toProjectionDto);
        return ResponseEntity.ok(pageableMapper.toDto(dtoPage));
    }

    @GetMapping("/cpf/{cpf}")
    @IsAdminOrClient
    public ResponseEntity<EmployeeResponseDto> findByCpf(@PathVariable String cpf) {
        Employee employee = employeeService.findByCpf(cpf);
        return ResponseEntity.ok(employeeMapper.toDto(employee));
    }

    @GetMapping("/email/{email}")
    @IsAdminOrClient
    public ResponseEntity<EmployeeResponseDto> findByEmail(@PathVariable String email) {
        Employee employee = employeeService.findByEmail(email);
        return ResponseEntity.ok(employeeMapper.toDto(employee));
    }

    @GetMapping("/search")
    @IsAdmin
    public ResponseEntity<PageableDto> search(@RequestParam(name = "q", required = false) String query, Pageable pageable) {
        Page<Employee> employeePage = employeeService.search(query, pageable);
        Page<EmployeeResponseDto> dtoPage = employeePage.map(employeeMapper::toDto);
        return ResponseEntity.ok(pageableMapper.toDto(dtoPage));
    }
}
