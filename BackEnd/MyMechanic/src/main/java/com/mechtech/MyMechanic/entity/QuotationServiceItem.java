package com.mechtech.MyMechanic.entity;

import com.mechtech.MyMechanic.multiTenants.TenantOwned;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;

@Getter
@Setter
@Entity
@Table(name = "quotation_service_items")
public class QuotationServiceItem extends AbstractEntity implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @ManyToOne
    @JoinColumn(name = "quotation_id", nullable = false)
    private Quotation quotation;

    @ManyToOne
    @JoinColumn(name = "repair_service_id", nullable = false)
    private RepairService repairService;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "service_cost", nullable = false, precision = 10, scale = 2)
    private BigDecimal serviceCost; // Custo do serviço no momento do orçamento

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        QuotationServiceItem that = (QuotationServiceItem) o;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}