package com.mechtech.MyMechanic.service;

import com.mechtech.MyMechanic.entity.Employee;
import com.mechtech.MyMechanic.exception.BusinessRuleException;
import com.mechtech.MyMechanic.exception.EntityNotFoundException;
import com.mechtech.MyMechanic.exception.UniqueConstraintViolationException;
import com.mechtech.MyMechanic.multiTenants.TenantContext;
import com.mechtech.MyMechanic.repository.EmployeeRepository;
import com.mechtech.MyMechanic.repository.projection.EmployeeProjection;
import com.mechtech.MyMechanic.repository.specification.EmployeeSpecification;
import com.mechtech.MyMechanic.util.ValidationUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.projection.ProjectionFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EmployeeService extends AbstractTenantAwareService<Employee, Long, EmployeeRepository> {

    private final ProjectionFactory projectionFactory;

    public EmployeeService(EmployeeRepository repository, ProjectionFactory projectionFactory) {
        super(repository);
        this.projectionFactory = projectionFactory;
    }

    @Transactional
    public Employee create(Employee employee) {
        ValidationUtils.validateCpf(employee.getCpf());
        if (repository.existsByCpf(employee.getCpf())){
            throw new UniqueConstraintViolationException("Já existe um funcionário com o CPF informado.");
        }
        if (repository.existsByEmail(employee.getEmail())){
            throw new UniqueConstraintViolationException("Já existe um funcionário com o email informado.");
        }
        if (repository.existsByPhone(employee.getPhone())){
            throw new UniqueConstraintViolationException("Já existe um funcionário com o telefone informado.");
        }
        employee.setTenant(TenantContext.getTenant());
        return repository.save(employee);
    }

    @Transactional(readOnly = true)
    public Page<EmployeeProjection> findAll(Pageable pageable) {
        Page<Employee> employeesPage = repository.findAll(pageable);
        return employeesPage.map(employee -> projectionFactory.createProjection(EmployeeProjection.class, employee));
    }

    @Transactional
    public Employee update(Employee employee) {
        if (employee.getCpf() != null ) {
            ValidationUtils.validateCpf(employee.getCpf());
        }
        return repository.save(employee);
    }

    @Transactional
    public void delete(Long id) {
        Employee employee = findById(id);
        repository.delete(employee);
    }

    @Transactional(readOnly = true)
    public Employee findByCpf(String cpf) {
        Employee employee = repository.findByCpf(cpf)
                .orElseThrow(() -> new EntityNotFoundException("Funcionário não encontrado com CPF: " + cpf));
        validateTenant(employee);
        return employee;
    }

    @Transactional(readOnly = true)
    public Employee findByEmail(String email) {
        Employee employee = repository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Funcionário não encontrado com email: " + email));
        validateTenant(employee);
        return employee;
    }

    @Transactional(readOnly = true)
    public Page<EmployeeProjection> search(String searchTerm, Pageable pageable) {
        Specification<Employee> spec = EmployeeSpecification.search(searchTerm);
        Page<Employee> employeesPage = repository.findAll(spec, pageable);
        return employeesPage.map(employee -> projectionFactory.createProjection(EmployeeProjection.class, employee));
    }
}
