package com.mechtech.MyMechanic.service;

import com.mechtech.MyMechanic.entity.*;
import com.mechtech.MyMechanic.exception.BusinessRuleException;
import com.mechtech.MyMechanic.exception.EntityNotFoundException;
import com.mechtech.MyMechanic.repository.ServiceOrderRepository;
import com.mechtech.MyMechanic.repository.projection.ServiceOrderProjection;
import com.mechtech.MyMechanic.repository.specification.ServiceOrderSpecification;
import com.mechtech.MyMechanic.web.dto.serviceorder.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.projection.ProjectionFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Service
public class ServiceOrderService extends AbstractTenantAwareService<ServiceOrder, Long, ServiceOrderRepository> {

    private final QuotationService quotationService;
    private final PartService partService;
    private final EmployeeService employeeService;
    private final VehicleService vehicleService;
    private final RepairServiceService repairServiceService;
    private final PdfGenerationService pdfGenerationService;
    private final ProjectionFactory projectionFactory;

    public ServiceOrderService(ServiceOrderRepository repository, QuotationService quotationService,
                               PartService partService, EmployeeService employeeService,
                               VehicleService vehicleService, RepairServiceService repairServiceService,
                               PdfGenerationService pdfGenerationService, ProjectionFactory projectionFactory) {
        super(repository);
        this.quotationService = quotationService;
        this.partService = partService;
        this.employeeService = employeeService;
        this.vehicleService = vehicleService;
        this.repairServiceService = repairServiceService;
        this.pdfGenerationService = pdfGenerationService;
        this.projectionFactory = projectionFactory;
    }

    @Transactional
    public ServiceOrder createDirect(ServiceOrderCreateDto dto) {
        Vehicle vehicle = vehicleService.findById(dto.getVehicleId());

        ServiceOrder serviceOrder = new ServiceOrder();
        serviceOrder.setTenant(vehicle.getTenant());
        serviceOrder.setVehicle(vehicle);
        serviceOrder.setClient(vehicle.getClient());
        if (dto.getDescription() != null) {
            serviceOrder.setDescription(dto.getDescription());
        }
        if (dto.getEntryDate() != null) {
            serviceOrder.setEntryDate(dto.getEntryDate());
        } else {
            serviceOrder.setEntryDate(LocalDateTime.now());
        }
        serviceOrder.setStatus(ServiceOrder.ServiceOrderStatus.PENDENTE);

        // Processar itens de peças
        Set<ServiceOrderPartItem> soPartItems = new HashSet<>();
        if (dto.getPartItems() != null) {
            for (ServiceOrderPartDto partItemDto : dto.getPartItems()) {
                Part part = partService.findById(partItemDto.getId());
                ServiceOrderPartItem soItem = new ServiceOrderPartItem();
                soItem.setServiceOrder(serviceOrder);
                soItem.setPart(part);
                soItem.setQuantity(partItemDto.getQuantity());
                if (partItemDto.getUnitCost() != null) {
                    soItem.setUnitPrice(partItemDto.getUnitCost());
                } else {
                    soItem.setUnitPrice(part.getPrice()); // Usa o preço atual da peça se não for fornecido
                }
                soPartItems.add(soItem);
            }
        }
        serviceOrder.setPartItems(soPartItems);

        // Processar itens de serviço
        Set<ServiceOrderServiceItem> soServiceItems = new HashSet<>();
        if (dto.getServiceItems() != null) {
            for (ServiceOrderServiceDto serviceItemDto : dto.getServiceItems()) {
                RepairService service = repairServiceService.findById(serviceItemDto.getId());
                ServiceOrderServiceItem soItem = new ServiceOrderServiceItem();
                soItem.setServiceOrder(serviceOrder);
                soItem.setRepairService(service);
                soItem.setQuantity(serviceItemDto.getQuantity());
                if (serviceItemDto.getUnitCost() != null) {
                    soItem.setServiceCost(serviceItemDto.getUnitCost());
                } else {
                    soItem.setServiceCost(service.getCost()); // Usa o custo padrão do serviço se não for fornecido
                }
                if (serviceItemDto.getEmployeeId() != null) {
                    Employee employee = employeeService.findById(serviceItemDto.getEmployeeId());
                    soItem.setEmployee(employee);
                } else {
                    soItem.setEmployee(null);
                }


                soServiceItems.add(soItem);
            }
        }
        serviceOrder.setServiceItems(soServiceItems);


        if (dto.getInitialMileage() != null) {
            serviceOrder.setInitialMileage(dto.getInitialMileage());
        }


        // Calcular o custo total
        serviceOrder.calculateTotalCost();

        return repository.save(serviceOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public ServiceOrder findById(Long id) {
        ServiceOrder serviceOrder = repository.findByIdWithItems(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        String.format("Ordem de serviço com id '%s' não encontrada.", id)
                ));
        validateTenant(serviceOrder);
        return serviceOrder;
    }

    @Transactional(readOnly = true)
    public Page<ServiceOrderProjection> findAll(Pageable pageable) {
        Page<ServiceOrder> serviceOrdersPage = repository.findAll(pageable);
        return serviceOrdersPage.map(order -> projectionFactory.createProjection(ServiceOrderProjection.class, order));
    }


    @Transactional
    public ServiceOrder createFromQuotation(Long quotationId) {
        // Usamos o findById do quotationService, que já carrega os itens
        Quotation quotation = quotationService.findById(quotationId);

        if (quotation.getStatus() != Quotation.QuotationStatus.AWAITING_CONVERSION) {
            throw new BusinessRuleException("Orçamento não pode ser convertido. Status atual: " + quotation.getStatus());
        }

        ServiceOrder serviceOrder = new ServiceOrder();
        serviceOrder.setTenant(quotation.getTenant());
        serviceOrder.setQuotation(quotation);
        serviceOrder.setClient(quotation.getClient());
        serviceOrder.setVehicle(quotation.getVehicle());
        if (quotation.getDescription() != null) {
            serviceOrder.setDescription(quotation.getDescription());
        }
        serviceOrder.setEntryDate(LocalDateTime.now());
        serviceOrder.setStatus(ServiceOrder.ServiceOrderStatus.PENDENTE); // Status default
        serviceOrder.setTotalCost(quotation.getTotalCost()); // O preço já foi calculado no orçamento

        Set<ServiceOrderPartItem> soPartItems = new HashSet<>();
        for (QuotationPartItem qItem : quotation.getPartItems()) {

            ServiceOrderPartItem soItem = new ServiceOrderPartItem();
            soItem.setServiceOrder(serviceOrder);
            soItem.setPart(qItem.getPart());
            soItem.setQuantity(qItem.getQuantity());
            soItem.setUnitPrice(qItem.getUnitPrice());
            soPartItems.add(soItem);
        }
        serviceOrder.setPartItems(soPartItems);

        Set<ServiceOrderServiceItem> soServiceItems = new HashSet<>();
        for (QuotationServiceItem qItem : quotation.getServiceItems()) {
            ServiceOrderServiceItem soItem = new ServiceOrderServiceItem();
            soItem.setServiceOrder(serviceOrder);
            soItem.setRepairService(qItem.getRepairService());
            soItem.setServiceCost(qItem.getServiceCost());
            soServiceItems.add(soItem);


        }
        serviceOrder.setServiceItems(soServiceItems);

        quotation.setStatus(Quotation.QuotationStatus.CONVERTED_TO_ORDER);

        return repository.save(serviceOrder);
    }

    @Transactional(readOnly = true)
    public byte[] getServiceOrderAsPdf(Long serviceOrderId) {
        // Usa o findById que já carrega os itens e valida o tenant
        ServiceOrder serviceOrder = findById(serviceOrderId);
        return pdfGenerationService.generateServiceOrderPdf(serviceOrder);
    }


    @Transactional
    public void delete(Long id) {
        // O findById já valida se a OS existe e pertence ao tenant
        ServiceOrder serviceOrder = this.findById(id);
        repository.delete(serviceOrder);
    }

    @Transactional(readOnly = true)
    public Page<ServiceOrderProjection> search(String searchTerm, Pageable pageable) {
        Specification<ServiceOrder> spec = ServiceOrderSpecification.search(searchTerm);
        Page<ServiceOrder> serviceOrdersPage = repository.findAll(spec, pageable);
        return serviceOrdersPage.map(order -> projectionFactory.createProjection(ServiceOrderProjection.class, order));
    }

    @Transactional
    public ServiceOrder update(Long id, ServiceOrderUpdateDto dto) {
        ServiceOrder serviceOrder = findById(id);

        if (dto.getStatus() != null) {
            ServiceOrder.ServiceOrderStatus newStatus = ServiceOrder.ServiceOrderStatus.valueOf(dto.getStatus());
            validateStatusTransition(serviceOrder.getStatus(), newStatus);
            serviceOrder.setStatus(newStatus);
        }
        if (dto.getInitialMileage() != null) {
            serviceOrder.setInitialMileage(dto.getInitialMileage());
        }


        if (ServiceOrder.ServiceOrderStatus.valueOf(dto.getStatus()) == ServiceOrder.ServiceOrderStatus.EM_PROGRESSO
                && serviceOrder.getStatus() == ServiceOrder.ServiceOrderStatus.PENDENTE) {
            if (dto.getInitialMileage() == null && serviceOrder.getInitialMileage() == null) {
                throw new BusinessRuleException("A quilometragem inicial é obrigatória para iniciar o serviço.");
            }
        }




        if (dto.getDescription() != null) {
            serviceOrder.setDescription(dto.getDescription());
        }

        if (dto.getPartItems() != null) {
            serviceOrder.getPartItems().clear();
            for (ServiceOrderPartDto partItemDto : dto.getPartItems()) {
                Part part = partService.findById(partItemDto.getId());
                ServiceOrderPartItem soItem = new ServiceOrderPartItem();
                soItem.setServiceOrder(serviceOrder);
                soItem.setPart(part);
                soItem.setQuantity(partItemDto.getQuantity());
                if (partItemDto.getUnitCost() != null) {
                    soItem.setUnitPrice(partItemDto.getUnitCost());
                } else {
                    soItem.setUnitPrice(part.getPrice());
                }
                serviceOrder.getPartItems().add(soItem);
            }
        }

        if (dto.getServiceItems() != null) {
            serviceOrder.getServiceItems().clear();
            for (ServiceOrderServiceDto serviceItemDto : dto.getServiceItems()) {
                RepairService service = repairServiceService.findById(serviceItemDto.getId());
                ServiceOrderServiceItem soItem = new ServiceOrderServiceItem();
                soItem.setServiceOrder(serviceOrder);
                soItem.setRepairService(service);
                soItem.setQuantity(serviceItemDto.getQuantity());
                if (serviceItemDto.getUnitCost() != null) {
                    soItem.setServiceCost(serviceItemDto.getUnitCost());
                } else {
                    soItem.setServiceCost(service.getCost());
                }

                if (serviceItemDto.getEmployeeId() != null) {
                    soItem.setEmployee(employeeService.findById(serviceItemDto.getEmployeeId()));
                } else {
                    if (ServiceOrder.ServiceOrderStatus.valueOf(dto.getStatus()) == ServiceOrder.ServiceOrderStatus.COMPLETO )
                        throw new BusinessRuleException("O funcionário é obrigatório para itens de serviço ao completar a OS.");
                    soItem.setEmployee(null);
                }

                serviceOrder.getServiceItems().add(soItem);
            }
        }

        // Recalcular o custo total se houver atualização de itens
        if (dto.getPartItems() != null || dto.getServiceItems() != null) {
            serviceOrder.calculateTotalCost();
        }

        //  Validação de OS vazia ao COMPLETA e definição da data de saída
        if (serviceOrder.getStatus() == ServiceOrder.ServiceOrderStatus.COMPLETO) {
            validateServiceOrderItems(serviceOrder);
            if (serviceOrder.getExitDate() == null) {
                serviceOrder.setExitDate(LocalDateTime.now());
            }
        } else if (serviceOrder.getStatus() != ServiceOrder.ServiceOrderStatus.COMPLETO) {
            serviceOrder.setExitDate(null);
        }

        return repository.save(serviceOrder);
    }


    private void validateStatusTransition(ServiceOrder.ServiceOrderStatus oldStatus, ServiceOrder.ServiceOrderStatus newStatus) {
        if (oldStatus == newStatus) {
            return;
        }

        // Regras gerais para status final
        if (oldStatus == ServiceOrder.ServiceOrderStatus.COMPLETO) {
            throw new BusinessRuleException("A Ordem de Serviço já está COMPLETA e não pode ser alterada.");
        }
        if (oldStatus == ServiceOrder.ServiceOrderStatus.CANCELADO) {
            throw new BusinessRuleException("A Ordem de Serviço foi CANCELADA e não pode ser alterada.");
        }


        if (oldStatus == ServiceOrder.ServiceOrderStatus.PENDENTE) {
            if (newStatus != ServiceOrder.ServiceOrderStatus.EM_PROGRESSO && newStatus != ServiceOrder.ServiceOrderStatus.CANCELADO) {
                throw new BusinessRuleException(String.format("Status inválido. De %s, só é possível ir para %s ou %s.", oldStatus, ServiceOrder.ServiceOrderStatus.EM_PROGRESSO, ServiceOrder.ServiceOrderStatus.CANCELADO));
            }
        } else if (oldStatus == ServiceOrder.ServiceOrderStatus.EM_PROGRESSO) {
            if (newStatus != ServiceOrder.ServiceOrderStatus.COMPLETO && newStatus != ServiceOrder.ServiceOrderStatus.CANCELADO) {
                throw new BusinessRuleException(String.format("Status inválido. De %s, só é possível ir para %s ou %s.", oldStatus, ServiceOrder.ServiceOrderStatus.COMPLETO, ServiceOrder.ServiceOrderStatus.CANCELADO));
            }
        }
    }

    private void validateServiceOrderItems(ServiceOrder serviceOrder) {
        if ((serviceOrder.getPartItems() == null || serviceOrder.getPartItems().isEmpty()) &&
                (serviceOrder.getServiceItems() == null || serviceOrder.getServiceItems().isEmpty())) {
            throw new BusinessRuleException("A Ordem de Serviço não pode ser marcada como COMPLETA se não contiver peças ou serviços.");
        }
    }
}
