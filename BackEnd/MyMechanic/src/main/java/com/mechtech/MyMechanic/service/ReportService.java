package com.mechtech.MyMechanic.service;

import com.mechtech.MyMechanic.entity.ServiceOrder;
import com.mechtech.MyMechanic.entity.ServiceOrderServiceItem;
import com.mechtech.MyMechanic.repository.ServiceOrderRepository;
import com.mechtech.MyMechanic.web.dto.report.CommissionReportDto;
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
}