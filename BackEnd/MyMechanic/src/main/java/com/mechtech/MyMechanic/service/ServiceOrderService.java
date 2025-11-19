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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class ServiceOrderService extends AbstractTenantAwareService<ServiceOrder, Long, ServiceOrderRepository> {

    private final QuotationService quotationService;
    private final PartService partService;
    private final EmployeeService employeeService;
    private final VehicleService vehicleService;
    private final RepairServiceService repairServiceService;
    private final PdfGenerationService pdfGenerationService;

    public ServiceOrderService(ServiceOrderRepository repository, QuotationService quotationService,
                               PartService partService, EmployeeService employeeService,
                               VehicleService vehicleService, RepairServiceService repairServiceService,
                               PdfGenerationService pdfGenerationService) {
        super(repository);
        this.quotationService = quotationService;
        this.partService = partService;
        this.employeeService = employeeService;
        this.vehicleService = vehicleService;
        this.repairServiceService = repairServiceService;
        this.pdfGenerationService = pdfGenerationService;
    }

    @Transactional
    public ServiceOrder createDirect(ServiceOrderCreateDto dto) {
        Vehicle vehicle = vehicleService.findById(dto.getVehicleId());

        ServiceOrder serviceOrder = new ServiceOrder();
        serviceOrder.setTenantId(vehicle.getTenantId());
        serviceOrder.setVehicle(vehicle);
        serviceOrder.setClient(vehicle.getClient());
        serviceOrder.setDescription(dto.getDescription());
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
                if (partItemDto.getPrice() != null) {
                    soItem.setUnitPrice(partItemDto.getPrice());
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
                if (serviceItemDto.getCost() != null) {
                    soItem.setServiceCost(serviceItemDto.getCost());
                } else {
                    soItem.setServiceCost(service.getCost()); // Usa o custo padrão do serviço se não for fornecido
                }
                soServiceItems.add(soItem);
            }
        }
        serviceOrder.setServiceItems(soServiceItems);

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
        return repository.findAllProjectedBy(pageable);
    }


    @Transactional
    public ServiceOrder createFromQuotation(Long quotationId) {
        // Usamos o findById do quotationService, que já carrega os itens
        Quotation quotation = quotationService.findById(quotationId);

        if (quotation.getStatus() != Quotation.QuotationStatus.AWAITING_CONVERSION) {
            throw new BusinessRuleException("Orçamento não pode ser convertido. Status atual: " + quotation.getStatus());
        }

        ServiceOrder serviceOrder = new ServiceOrder();
        serviceOrder.setTenantId(quotation.getTenantId());
        serviceOrder.setQuotation(quotation);
        serviceOrder.setClient(quotation.getClient());
        serviceOrder.setVehicle(quotation.getVehicle());
        serviceOrder.setDescription(quotation.getDescription());
        serviceOrder.setEntryDate(LocalDateTime.now());
        serviceOrder.setStatus(ServiceOrder.ServiceOrderStatus.PENDENTE);
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
    public Page<ServiceOrder> search(String searchTerm, Pageable pageable) {
        return repository.findAll(ServiceOrderSpecification.search(searchTerm), pageable);
    }

    @Transactional
    public ServiceOrder update(Long id, ServiceOrderUpdateDto dto) {
        ServiceOrder serviceOrder = findById(id);

        // Validar Transição de Status
        if (dto.getStatus() != null) {
            ServiceOrder.ServiceOrderStatus newStatus = ServiceOrder.ServiceOrderStatus.valueOf(dto.getStatus());
            validateStatusTransition(serviceOrder.getStatus(), newStatus);
            serviceOrder.setStatus(newStatus);
        }

        if (dto.getEmployees() != null) {
            // Limpa os funcionários antigos para garantir que a lista seja substituída
            serviceOrder.getEmployees().clear();

            // Adiciona os novos funcionários com a sua comissão e horas
            dto.getEmployees().forEach(EmployeeDto -> {
                Employee employee = employeeService.findById(EmployeeDto.getId());
                ServiceOrderEmployee soEmployeeItem = new ServiceOrderEmployee();
                soEmployeeItem.setServiceOrder(serviceOrder);
                soEmployeeItem.setEmployee(employee);
                soEmployeeItem.setCommissionPercentage(EmployeeDto.getCommissionPercentage());
                soEmployeeItem.setWorkedHours(EmployeeDto.getWorkedHours());
                serviceOrder.getEmployees().add(soEmployeeItem);
            });
        }

        if (dto.getDescription() != null) {
            serviceOrder.setDescription(dto.getDescription());
        }

        //  Usar clear() e add() na coleção gerenciada (partItems)
        if (dto.getPartItems() != null) {
            // 1. Limpa a coleção gerenciada para marcar os antigos para remoção (ORPHAN REMOVAL)
            serviceOrder.getPartItems().clear();

            for (ServiceOrderPartDto partItemDto : dto.getPartItems()) {
                Part part = partService.findById(partItemDto.getId());
                ServiceOrderPartItem soItem = new ServiceOrderPartItem();
                soItem.setServiceOrder(serviceOrder);
                soItem.setPart(part);
                soItem.setQuantity(partItemDto.getQuantity());
                if (partItemDto.getPrice() != null) {
                    soItem.setUnitPrice(partItemDto.getPrice());
                } else {
                    soItem.setUnitPrice(part.getPrice());
                }
                serviceOrder.getPartItems().add(soItem);
            }
        }

        //  Usar clear() e add() na coleção gerenciada (serviceItems)
        if (dto.getServiceItems() != null) {
            // 1. Limpa a coleção gerenciada para marcar os antigos para remoção
            serviceOrder.getServiceItems().clear();


            for (ServiceOrderServiceDto serviceItemDto : dto.getServiceItems()) {
                RepairService service = repairServiceService.findById(serviceItemDto.getId());
                ServiceOrderServiceItem soItem = new ServiceOrderServiceItem();
                soItem.setServiceOrder(serviceOrder);
                soItem.setRepairService(service);
                if (serviceItemDto.getCost() != null) {
                    soItem.setServiceCost(serviceItemDto.getCost());
                } else {
                    soItem.setServiceCost(service.getCost());
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
            // Garante que a data de saída seja nula se o status voltar para EM_PROGRESSO ou PENDENTE
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