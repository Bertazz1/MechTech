package com.mechtech.MyMechanic.repository.projection;

import com.mechtech.MyMechanic.entity.Address;
import com.mechtech.MyMechanic.entity.Role;

public interface EmployeeProjection {
        Long getId();
        String getName();
        Role getRole();
        String getEmail();
        String getPhone();
        Address getAddress();
    }

