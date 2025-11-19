package com.mechtech.MyMechanic.repository.projection;

public interface VehicleProjection {

    Long getId();

    String getBrand();

    String getModel();

    String getYear();

    String getLicensePlate();

    String getClientId();

    String getClientName();

    String getColor();
}