package com.mechtech.MyMechanic.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.Setter;
import org.hibernate.annotations.Filter;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.mechtech.MyMechanic.multiTenants.TenantOwned;

import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@Entity(name = "Quotation")
@Table(name = "quotations")
@Filter(name = "tenantFilter", condition = "tenant_id = :tenantId")
public class Quotation extends AbstractEntity implements Serializable, TenantOwned {

    @Serial
    private static final long serialVersionUID = 1L;

    @jakarta.persistence.Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "tenant_id", nullable = false, updatable = false)
    private String tenantId;

    @Column(name = "description", length = 300)
    private String description;

    @Column(name = "status", nullable = false)
    private QuotationStatus status = QuotationStatus.AWAITING_CONVERSION;

    @Column(
            name = "TotalCost", nullable = false,
            scale = 2 // casas decimais
    )
    private BigDecimal TotalCost;

    @Column(name = "entry_date", nullable = false)
    private LocalDateTime entryTime;

    @Column(name = "exit_date")
    private LocalDateTime exitTime;

    @CreatedDate
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @CreatedBy
    @Column(name = "created_by")
    private String createdBy;

    @LastModifiedBy
    @Column(name = "updated_by")
    private String updatedBy;

    @ManyToOne
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @ManyToOne
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @OneToOne(mappedBy = "quotation")
    @JoinColumn(name = "service_order_id")
    private ServiceOrder serviceOrder;

    @OneToMany(mappedBy = "quotation", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<QuotationPartItem> partItems = new HashSet<>();

    @OneToMany(mappedBy = "quotation", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<QuotationServiceItem> serviceItems = new HashSet<>();

    @Transient
    public BigDecimal getTotalPartsPrice() {
        if (partItems == null) {
            return BigDecimal.ZERO;
        }
        return partItems.stream()
                .map(item -> item.getUnitPrice().multiply(new BigDecimal(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @Transient
    public BigDecimal getTotalServicesPrice() {
        if (serviceItems == null) {
            return BigDecimal.ZERO;
        }
        return serviceItems.stream()
                .map(QuotationServiceItem::getServiceCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }


    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Quotation that = (Quotation) o;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return 31;
    }

    public enum QuotationStatus {
        AWAITING_CONVERSION,
        CONVERTED_TO_ORDER,
        CANCELED
    }


    public void calculateTotalCost() {
        BigDecimal partsTotal = getTotalPartsPrice();
        BigDecimal servicesTotal = getTotalServicesPrice();
        this.TotalCost = partsTotal.add(servicesTotal);
    }


}
