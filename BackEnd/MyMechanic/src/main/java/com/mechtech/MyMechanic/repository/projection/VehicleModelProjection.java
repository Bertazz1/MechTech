package com.mechtech.MyMechanic.repository.projection;

import org.springframework.beans.factory.annotation.Value;

public interface VehicleModelProjection {
    Long getId();
    String getName();

    @Value("#{target.brand.name}")
    String getBrandName();

}
