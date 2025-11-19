package com.mechtech.MyMechanic.repository.projection;

import com.mechtech.MyMechanic.entity.Address;

public interface EmployeeProjection {
        Long getId();
        String getName();
        String getRole();
        String getEmail();
        String getPhone();
        Address getAddress();
    }

