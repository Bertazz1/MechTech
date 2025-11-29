package com.mechtech.MyMechanic.repository.projection;

import org.springframework.beans.factory.annotation.Value;

public interface VehicleProjection {

    Long getId();

    @Value("#{target.model.brand.name}")
    String getBrandName();

    @Value("#{target.model.name}")
    String getModelName();

    int getYear();

    String getLicensePlate();

    @Value("#{target.client.id}")
    Long getClientId();

    @Value("#{target.client.name}")
    String getClientName();

    String getColor();
}
