
@FilterDef(
        name = "tenantFilter",
        parameters = @ParamDef(name = "tenantId", type = String.class)
)
@FilterDef(
        name = "deletedFilter",
        defaultCondition = "deleted = false"
)
package com.mechtech.MyMechanic.entity;

import org.hibernate.annotations.FilterDef;
import org.hibernate.annotations.ParamDef;