package com.mechtech.MyMechanic.entity;

import com.mechtech.MyMechanic.multiTenants.TenantOwned;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Filter;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(name = "service_order")
@Filter(name = "tenantFilter", condition = "tenant_id = :tenantId")
public class ServiceOrder extends AbstractEntity implements Serializable, TenantOwned {

    @Serial
    private static final long serialVersionUID = 1L;

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
  private Long id;

    @ManyToOne
    @JoinColumn(name = "tenant_id", nullable = false, updatable = false)
    private Tenant tenant;

    @Column(name = "entry_date", nullable = false)
  private LocalDateTime entryDate;

    @Column(name = "exit_date")
  private LocalDateTime exitDate;

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
  private ServiceOrderStatus status = ServiceOrderStatus.PENDENTE;

    @Column(name = "description", length = 500)
  private String description;
    
    @Column(name = "total_cost")
    private BigDecimal totalCost;

  @OneToOne
  @JoinColumn(name = "Quotation_id")
  private Quotation quotation;

  @Column(name = "initial_mileage")
  private Integer initialMileage;

  @ManyToOne
  @JoinColumn(name = "vehicle_id", nullable = false)
  private Vehicle vehicle;

  @ManyToOne
  @JoinColumn(name = "client_id", nullable = false)
  private Client client;


  @OneToMany(mappedBy = "serviceOrder", cascade = CascadeType.ALL, orphanRemoval = true)
  private Set<ServiceOrderPartItem> partItems = new HashSet<>();

  @OneToMany(mappedBy = "serviceOrder", cascade = CascadeType.ALL, orphanRemoval = true)
  private Set<ServiceOrderServiceItem> serviceItems = new HashSet<>();


  @OneToOne(mappedBy = "serviceOrder", cascade = CascadeType.ALL)
  private Invoice invoice;

  public enum ServiceOrderStatus {
    PENDENTE,
    EM_PROGRESSO,
    COMPLETO,
    CANCELADO
  }

  @CreatedDate
  @Column(name = "created_at")
  private LocalDateTime createdAt;

  @LastModifiedDate
  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  @Override
  public boolean equals(Object o) {
    if (o == null || getClass() != o.getClass()) return false;
    ServiceOrder that = (ServiceOrder) o;
    return Objects.equals(id, that.id);
  }

  @Override
  public int hashCode() {
    return Objects.hashCode(id);
  }

  @CreatedBy
  @Column(name = "created_by")
  private String createdBy;

  @LastModifiedBy
  @Column(name = "updated_by")
  private String updatedBy;


  public void calculateTotalCost() {
    BigDecimal total = BigDecimal.ZERO;
    if (this.partItems != null) {
      for (ServiceOrderPartItem item : this.partItems) {
        total = total.add(item.getUnitPrice().multiply(new BigDecimal(item.getQuantity())));
      }
    }
    if (this.serviceItems != null) {
      for (ServiceOrderServiceItem item : this.serviceItems) {
        total = total.add(item.getServiceCost().multiply(new BigDecimal(item.getQuantity())));
      }
    }
    this.totalCost = total;
  }

    @Override
    public Tenant getTenant() {
        return this.tenant;
    }
}
