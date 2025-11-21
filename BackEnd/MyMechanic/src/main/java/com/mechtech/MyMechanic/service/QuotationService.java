package com.mechtech.MyMechanic.service;

import com.mechtech.MyMechanic.entity.*;
import com.mechtech.MyMechanic.exception.BusinessRuleException;
import com.mechtech.MyMechanic.exception.EntityNotFoundException;
import com.mechtech.MyMechanic.repository.QuotationRepository;
import com.mechtech.MyMechanic.repository.projection.QuotationProjection;
import com.mechtech.MyMechanic.repository.specification.QuotationSpecification;
import com.mechtech.MyMechanic.web.dto.quotation.QuotationPartItemDto;
import com.mechtech.MyMechanic.web.dto.quotation.QuotationServiceItemDto;
import com.mechtech.MyMechanic.web.dto.quotation.QuotationUpdateDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class QuotationService extends AbstractTenantAwareService<Quotation, Long, QuotationRepository> {

    private final VehicleService vehicleService;
    private final PartService partService;
    private final RepairServiceService repairServiceService;
    private final PdfGenerationService pdfGenerationService;

    public QuotationService(QuotationRepository repository, VehicleService vehicleService,
                            PartService partService, RepairServiceService repairServiceService,
                            PdfGenerationService pdfGenerationService) {
        super(repository);
        this.vehicleService = vehicleService;
        this.partService = partService;
        this.repairServiceService = repairServiceService;
        this.pdfGenerationService = pdfGenerationService;
    }

    @Override
    @Transactional(readOnly = true)
    public Quotation findById(Long id) {
        Quotation quotation = repository.findByIdWithItems(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        String.format("Orçamento com id '%s' não encontrado.", id)
                ));
        validateTenant(quotation);
        return quotation;
    }


    @Transactional
    public Quotation createQuotation(Quotation quotation, Long vehicleId, Set<QuotationPartItemDto> partItemsDto,
                                     Set<QuotationServiceItemDto> serviceItemsDto) {

        if (partItemsDto.isEmpty() && serviceItemsDto.isEmpty()){
            throw new IllegalArgumentException("Orçamento sem itens");
        }
        Vehicle vehicle = vehicleService.findById(vehicleId);
        quotation.setTenantId(vehicle.getTenantId());
        quotation.setVehicle(vehicle);
        quotation.setClient(vehicle.getClient());
        quotation.setStatus(Quotation.QuotationStatus.AWAITING_CONVERSION);

        Set<QuotationPartItem> partItems = new HashSet<>();
        if (!partItemsDto.isEmpty()) {
            for (QuotationPartItemDto itemDto : partItemsDto) {
                Part part = partService.findById(itemDto.getId());
                QuotationPartItem partItem = new QuotationPartItem();
                partItem.setQuotation(quotation);
                partItem.setPart(part);
                partItem.setQuantity(itemDto.getQuantity());
                if (itemDto.getUnitPrice() != null) {
                    partItem.setUnitPrice(itemDto.getUnitPrice());
                } else {
                    partItem.setUnitPrice(part.getPrice()); // Captura o preço de venda default
                }
                partItems.add(partItem);
            }
        }

        Set<QuotationServiceItem> serviceItems = new HashSet<>();
        if (serviceItemsDto != null) {
            for (QuotationServiceItemDto itemDto : serviceItemsDto) {
                RepairService service = repairServiceService.findById(itemDto.getId());
                QuotationServiceItem serviceItem = new QuotationServiceItem();
                serviceItem.setQuotation(quotation);
                serviceItem.setRepairService(service);
                if (itemDto.getUnitCost() != null) {
                    serviceItem.setServiceCost(itemDto.getUnitCost());
                } else {
                    serviceItem.setServiceCost(service.getCost()); // Captura o preço default do serviço
                }
                serviceItems.add(serviceItem);
            }
        }

        quotation.setPartItems(partItems);
        quotation.setServiceItems(serviceItems);
        quotation.calculateTotalCost();
        return repository.save(quotation);
    }

    @Transactional(readOnly = true)
    public Page<QuotationProjection> findAll(Pageable pageable) {
        return repository.findAllProjectedBy(pageable);
    }

    @Transactional(readOnly = true)
    public List<Quotation> findByVehicleId(Long vehicleId) {
        vehicleService.findById(vehicleId);
        return repository.findByVehicleId(vehicleId).orElseThrow(
                () -> new EntityNotFoundException("Orçamento não encontrado para o veiculo com id: " + vehicleId));
    }

    @Transactional
    public void delete(Quotation deleted) {
        if (deleted == null || deleted.getId() == null) {
            throw new EntityNotFoundException("Orçamento não encontrado");
        }
        repository.delete(deleted);
    }

    @Transactional
    public Quotation update(Long id, QuotationUpdateDto dto) {
        Quotation existingQuotation = findById(id); // O findById já carrega os itens

        validateStatusUpdate(existingQuotation.getStatus(), Quotation.QuotationStatus.valueOf(dto.getStatus()));

        // Atualiza os campos simples do orçamento
        if (dto.getDescription() != null) {
            existingQuotation.setDescription(dto.getDescription());
        }
        if (dto.getStatus() != null) {
            existingQuotation.setStatus(Quotation.QuotationStatus.valueOf(dto.getStatus()));
        }
        if (dto.getEntryTime() != null) {
            existingQuotation.setEntryTime(dto.getEntryTime());
        }

        // Limpa os itens antigos para substituí-los pelos novos
        existingQuotation.getPartItems().clear();
        existingQuotation.getServiceItems().clear();

        // Adiciona os novos itens de peças, se houver
        if (dto.getPartItems() != null) {
            for (QuotationPartItemDto itemDto : dto.getPartItems()) {
                Part part = partService.findById(itemDto.getId());
                QuotationPartItem partItem = new QuotationPartItem();
                partItem.setQuotation(existingQuotation);
                partItem.setPart(part);
                partItem.setQuantity(itemDto.getQuantity());
                partItem.setUnitPrice(itemDto.getUnitPrice() != null ? itemDto.getUnitPrice() : part.getPrice());
                existingQuotation.getPartItems().add(partItem);
            }
        }

        // Adiciona os novos itens de serviço, se houver
        if (dto.getServiceItems() != null) {
            for (QuotationServiceItemDto itemDto : dto.getServiceItems()) {
                RepairService service = repairServiceService.findById(itemDto.getId());
                QuotationServiceItem serviceItem = new QuotationServiceItem();
                serviceItem.setQuotation(existingQuotation);
                serviceItem.setRepairService(service);
                serviceItem.setServiceCost(itemDto.getUnitCost() != null ? itemDto.getUnitCost() : service.getCost());
                existingQuotation.getServiceItems().add(serviceItem);
            }
        }

        // Recalcula o custo total e salva
        existingQuotation.calculateTotalCost();
        return repository.save(existingQuotation);
    }

    @Transactional(readOnly = true)
    public Page<Quotation> search(String searchTerm, Pageable pageable) {
        return repository.findAll(QuotationSpecification.search(searchTerm), pageable);
    }

    @Transactional(readOnly = true)
    public byte[] getQuotationAsPdf(Long quotationId) {
        Quotation quotation = findById(quotationId);
        if (quotation.getStatus() == Quotation.QuotationStatus.CANCELED){
            throw new BusinessRuleException("Orçamento cancelado não pode ser impresso!");
        }
        return pdfGenerationService.generateQuotationPdf(quotation);
    }

    public void validateStatusUpdate(Quotation.QuotationStatus oldStatus, Quotation.QuotationStatus newStatus){
        if (oldStatus == newStatus){
            return;
        }
        if (oldStatus == Quotation.QuotationStatus.CANCELED){
            throw new BusinessRuleException("Orçamento cancelado não pode ser alterado.");

        }
    }
}