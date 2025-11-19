package com.mechtech.MyMechanic.entity;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.SQLDelete;

import java.io.Serializable;

@Getter
@Setter
@MappedSuperclass
@SQLDelete(sql = "UPDATE #{#entityName} SET deleted = true WHERE id = ?")
@Filter(name = "deletedFilter")
public abstract class AbstractEntity implements Serializable {

    @Column(name = "deleted", nullable = false)
    private boolean deleted = false;
}