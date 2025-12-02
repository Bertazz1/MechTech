package com.mechtech.MyMechanic.multiTenants;

import com.mechtech.MyMechanic.entity.Tenant;

public interface TenantOwned {
    Tenant getTenant();
}
