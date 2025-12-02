package com.mechtech.MyMechanic.multiTenants;

import com.mechtech.MyMechanic.entity.Tenant;

public class TenantContext {
    private static final ThreadLocal<Tenant> currentTenant = new ThreadLocal<>();

    public static void setTenant(Tenant tenant) {
        currentTenant.set(tenant);
    }

    public static Tenant getTenant() {
        return currentTenant.get();
    }

    public static void clear() {
        currentTenant.remove();
    }
}
