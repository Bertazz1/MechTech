package com.mechtech.MyMechanic.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Objects;

@Getter
@Setter
@Entity
@Table(name = "service_order_service_items")
public class ServiceOrderServiceItem extends AbstractEntity implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "service_order_id", nullable = false)
    private ServiceOrder serviceOrder;

    @ManyToOne
    @JoinColumn(name = "repair_service_id", nullable = false)
    private RepairService repairService;

    @Column(name = "service_cost", nullable = false, precision = 10, scale = 2)
    private BigDecimal serviceCost; // Custo do serviço no momento da criação da OS

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ServiceOrderServiceItem that = (ServiceOrderServiceItem) o;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
