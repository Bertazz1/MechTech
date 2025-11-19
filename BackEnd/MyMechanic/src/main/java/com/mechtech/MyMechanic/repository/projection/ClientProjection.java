package com.mechtech.MyMechanic.repository.projection;


import com.mechtech.MyMechanic.entity.Address;

public interface ClientProjection {

    Long getId();

    String getName();

    String getEmail();

    String getPhone();

    String getCpf();

    Address getAddress();
}
