package com.mechtech.MyMechanic.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.util.UUID;

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

    @Column(nullable = false)
    private String document; // CNPJ

    @Column(nullable = false)
    private String email;

    private String phone;

    private Boolean active = true;

    @Column(name = "logo", columnDefinition = "bytea")
    private byte[] logo;

    @Column(name = "logo_content_type")
    private String logoContentType;

    @Column(name = "invite_token", unique = true)
    private String inviteToken;

    @PrePersist
    public void generateToken() {
        if (this.inviteToken == null) {
            this.inviteToken = UUID.randomUUID().toString();
        }
    }

}
