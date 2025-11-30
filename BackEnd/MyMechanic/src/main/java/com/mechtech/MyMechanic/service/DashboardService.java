package com.mechtech.MyMechanic.service;

import com.mechtech.MyMechanic.entity.Invoice;
import com.mechtech.MyMechanic.entity.ServiceOrder;
import com.mechtech.MyMechanic.repository.ClientRepository;
import com.mechtech.MyMechanic.repository.InvoiceRepository;
import com.mechtech.MyMechanic.repository.ServiceOrderRepository;
import com.mechtech.MyMechanic.repository.VehicleRepository;
import com.mechtech.MyMechanic.web.dto.dashboard.DashboardStatsDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ClientRepository clientRepository;
    private final VehicleRepository vehicleRepository;
    private final ServiceOrderRepository serviceOrderRepository;
    private final InvoiceRepository invoiceRepository;

    @Transactional(readOnly = true)
    public DashboardStatsDto getStats() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfMonth = now.with(TemporalAdjusters.firstDayOfMonth()).withHour(0).withMinute(0);
        LocalDateTime endOfMonth = now.with(TemporalAdjusters.lastDayOfMonth()).withHour(23).withMinute(59);

        return DashboardStatsDto.builder()
                .clientsCount(clientRepository.count())
                .vehiclesCount(vehicleRepository.count())
                .activeOrdersCount(serviceOrderRepository.countByStatus(ServiceOrder.ServiceOrderStatus.EM_PROGRESSO))
                .pendingInvoicesCount(invoiceRepository.countByPaymentStatus(Invoice.PaymentStatus.PENDING))
                .monthlyRevenue(serviceOrderRepository.sumTotalCostByExitDateBetween(startOfMonth, endOfMonth))
                .build();
    }
}