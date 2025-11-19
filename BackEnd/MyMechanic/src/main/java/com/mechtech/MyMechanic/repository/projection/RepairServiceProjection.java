package com.mechtech.MyMechanic.repository.projection;

public interface RepairServiceProjection {
    Long getId();

    String getName();

    String getDescription();

    java.math.BigDecimal getCost();


}
