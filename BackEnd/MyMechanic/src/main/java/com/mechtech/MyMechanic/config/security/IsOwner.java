package com.mechtech.MyMechanic.config.security;

import org.springframework.security.access.prepost.PreAuthorize;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

@Retention(RetentionPolicy.RUNTIME)
@PreAuthorize("#id == authentication.principal.id")
public @interface IsOwner {}