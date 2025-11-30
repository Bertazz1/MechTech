package com.mechtech.MyMechanic.service;

import com.mechtech.MyMechanic.entity.ServiceOrder;
import com.mechtech.MyMechanic.entity.ServiceOrderEmployee;
import com.mechtech.MyMechanic.entity.ServiceOrderServiceItem;
import com.mechtech.MyMechanic.repository.ServiceOrderRepository;
import com.mechtech.MyMechanic.web.dto.report.CommissionReportDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ServiceOrderRepository serviceOrderRepository;

    @Transactional(readOnly = true)
    public List<CommissionReportDto> getCommissionReport(LocalDate startDate, LocalDate endDate) {
        // Busca OS finalizadas no período
        List<ServiceOrder> orders = serviceOrderRepository.findCompletedOrdersBetween(
                startDate.atStartOfDay(),
                endDate.atTime(23, 59, 59)
        );

        Map<Long, CommissionReportDto> reportMap = new HashMap<>();

        for (ServiceOrder order : orders) {
            // Calcula o total de Mão de obra da OS.
            BigDecimal totalServicesValue = order.getServiceItems().stream()
                    .map(item -> {
                        BigDecimal cost = item.getServiceCost() != null ? item.getServiceCost() : BigDecimal.ZERO;
                        return cost.multiply(BigDecimal.valueOf(item.getQuantity()));
                    })
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            for (ServiceOrderEmployee soEmployee : order.getEmployees()) {
                Long empId = soEmployee.getEmployee().getId();

                CommissionReportDto dto = reportMap.getOrDefault(empId, CommissionReportDto.builder()
                        .employeeName(soEmployee.getEmployee().getName())
                        .employeeRole(soEmployee.getEmployee().getRole().getName())
                        .completedOrdersCount(0)
                        .totalCommission(BigDecimal.ZERO)
                        .build());

                // Cálculo: (Total Mão de Obra) * (% Comissão / 100)
                BigDecimal commissionPercent = soEmployee.getCommissionPercentage().divide(BigDecimal.valueOf(100));
                BigDecimal commissionValue = totalServicesValue.multiply(commissionPercent);

                dto.setTotalCommission(dto.getTotalCommission().add(commissionValue));
                dto.setCompletedOrdersCount(dto.getCompletedOrdersCount() + 1);

                reportMap.put(empId, dto);
            }
        }

        return new ArrayList<>(reportMap.values());
    }
}