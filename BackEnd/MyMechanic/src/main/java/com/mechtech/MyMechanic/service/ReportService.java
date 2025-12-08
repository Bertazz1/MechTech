package com.mechtech.MyMechanic.service;

import com.mechtech.MyMechanic.entity.ServiceOrder;
import com.mechtech.MyMechanic.entity.ServiceOrderServiceItem;
import com.mechtech.MyMechanic.exception.BusinessRuleException;
import com.mechtech.MyMechanic.repository.ServiceOrderRepository;
import com.mechtech.MyMechanic.repository.specification.ServiceOrderSpecification;
import com.mechtech.MyMechanic.web.dto.report.CommissionReportDto;
import com.mechtech.MyMechanic.web.dto.report.ServiceOrderFilter;
import com.mechtech.MyMechanic.web.dto.report.ServiceOrderReportDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ServiceOrderRepository serviceOrderRepository;

    @Transactional(readOnly = true)
    public List<CommissionReportDto> getCommissionReport(LocalDate startDate, LocalDate endDate) {
        List<ServiceOrder> orders = serviceOrderRepository.findCompletedOrdersBetween(
                startDate.atStartOfDay(),
                endDate.atTime(23, 59, 59)
        );

        Map<Long, CommissionReportDto> reportMap = new HashMap<>();

        for (ServiceOrder order : orders) {
            // ITERA SOBRE OS ITENS DE SERVIÇO
            for (ServiceOrderServiceItem item : order.getServiceItems()) {

                if (item.getEmployee() == null) continue; // Sem funcionário, sem comissão

                Long empId = item.getEmployee().getId();

                CommissionReportDto dto = reportMap.getOrDefault(empId, CommissionReportDto.builder()
                        .employeeName(item.getEmployee().getName())
                        .employeeRole(item.getEmployee().getRole() != null ? item.getEmployee().getRole().getName() : "Sem Cargo")
                        .completedOrdersCount(0)
                        .totalCommission(BigDecimal.ZERO)
                        .build());

                // Valor total do ITEM (Preço * Qtd)
                BigDecimal itemTotal = item.getServiceCost().multiply(BigDecimal.valueOf(item.getQuantity()));

                // % de comissão do funcionário
                BigDecimal commissionPercent = item.getEmployee().getCommissionPercentage() != null
                        ? item.getEmployee().getCommissionPercentage()
                        : BigDecimal.ZERO;

                // Cálculo
                BigDecimal commissionValue = itemTotal
                        .multiply(commissionPercent)
                        .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

                dto.setTotalCommission(dto.getTotalCommission().add(commissionValue));
                dto.setCompletedOrdersCount(dto.getCompletedOrdersCount() + 1); // Conta +1 serviço realizado

                reportMap.put(empId, dto);
            }
        }
        return new ArrayList<>(reportMap.values());
    }

    @Transactional(readOnly = true)
    public List<ServiceOrderReportDto> generateServiceOrderReport(ServiceOrderFilter filter) {
        // Validação de datas
        if (filter.getStartDate() != null && filter.getEndDate() != null && filter.getStartDate().isAfter(filter.getEndDate())) {
            throw new BusinessRuleException("A data inicial não pode ser posterior à data final.");
        }

        // Busca com Specification
        List<ServiceOrder> orders = serviceOrderRepository.findAll(ServiceOrderSpecification.withFilter(filter));

        return orders.stream()
                .map(this::mapToReportDto)
                .collect(Collectors.toList());
    }

    // Helper para mapeamento e cálculos financeiros precisos
    private ServiceOrderReportDto mapToReportDto(ServiceOrder os) {
        BigDecimal partsTotal = os.getPartItems().stream()
                .map(item -> item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal servicesTotal = os.getServiceItems().stream()
                .map(item -> item.getServiceCost().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Total = (Peças + Serviços)
        BigDecimal total = partsTotal.add(servicesTotal);

        return ServiceOrderReportDto.builder()
                .id(os.getId())
                .clientName(os.getClient() != null ? os.getClient().getName() : "N/A")
                .vehiclePlate(os.getVehicle() != null ? os.getVehicle().getLicensePlate() : "N/A")
                .vehicleModel(os.getVehicle() != null && os.getVehicle().getModel() != null
                        ? os.getVehicle().getModel().getName() : "N/A")
                .entryDate(os.getEntryDate())
                .exitDate(os.getExitDate())
                .status(os.getStatus().name())
                .partsTotal(partsTotal)
                .servicesTotal(servicesTotal)
                .totalAmount(total)
                .build();
    }
}