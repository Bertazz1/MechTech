package com.mechtech.MyMechanic.repository.projection;

import org.springframework.beans.factory.annotation.Value;

public interface VehicleProjection {

    Long getId();

    String getBrand();

    String getModel();

    int getYear();

    String getLicensePlate();

    @Value("#{target.client.id}")
    Long getClientId();

    @Value("#{target.client.name}")
    String getClientName();

    String getColor();
}
