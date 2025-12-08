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
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@EntityListeners(AuditingEntityListener.class)
@Filter(name = "tenantFilter", condition = "tenant_id = :tenantId")
public class Part extends AbstractEntity implements Serializable, TenantOwned {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id @GeneratedValue
    private Long id;

    @ManyToOne
    @JoinColumn(name = "tenant_id", nullable = false, updatable = false)
    private Tenant tenant;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "price", nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "code", unique = true, length = 100)
    private String code;

    @Column(name = "supplier ", length = 100)
    private String supplier ;

    @Column(name = "buy_date", columnDefinition = "TIMESTAMP")
    private LocalDateTime buyDate;

    @OneToMany(mappedBy = "part")
    private Set<QuotationPartItem> quotationItems = new HashSet<>();

    @OneToMany(mappedBy = "part")
    private Set<ServiceOrderPartItem> serviceOrderItems = new HashSet<>();

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


    public void setBuyDate(LocalDateTime buyDate) {

        if (buyDate != null) {
            if (buyDate.isAfter(LocalDateTime.now())) {
                throw new IllegalArgumentException("Buy date cannot be in the future.");
            }
            this.buyDate = buyDate;
        }
        else {
            this.buyDate = LocalDateTime.now();
        }
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Part part = (Part) o;
        return Objects.equals(id, part.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }

    @Override
    public Tenant getTenant() {
        return this.tenant;
    }
}
