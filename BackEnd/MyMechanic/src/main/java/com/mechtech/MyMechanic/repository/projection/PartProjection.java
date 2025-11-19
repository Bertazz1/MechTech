package com.mechtech.MyMechanic.repository.projection;

import java.math.BigDecimal;

public interface PartProjection {
    Long getId();
    String getName();
    BigDecimal getPrice();
    String getDescription();
    String getCode();
    String getSupplier();

}
