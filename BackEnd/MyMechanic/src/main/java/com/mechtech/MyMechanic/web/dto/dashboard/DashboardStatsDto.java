package com.mechtech.MyMechanic.web.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDto {
    private long clientsCount;
    private long vehiclesCount;
    private long activeOrdersCount;
    private long pendingInvoicesCount;
    private BigDecimal monthlyRevenue;
}