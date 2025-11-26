package com.mechtech.MyMechanic.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Setter
@Entity
@Table(name = "tenants")
public class Tenant extends AbstractEntity implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String document; // CNPJ

    private String email;

    private String phone;

    private Boolean active = true;

    @Lob
    @Column(name = "logo", columnDefinition = "bytea")
    private byte[] logo;

    @Column(name = "logo_content_type")
    private String logoContentType;

}
