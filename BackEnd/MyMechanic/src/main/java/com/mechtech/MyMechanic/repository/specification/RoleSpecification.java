package com.mechtech.MyMechanic.repository.specification;

import com.mechtech.MyMechanic.entity.Role;
import org.springframework.data.jpa.domain.Specification;

public class RoleSpecification {
    public static Specification<Role> search(String searchTerm) {
        return (root, query, cb) -> {
            if (searchTerm == null || searchTerm.isEmpty()) {
                return null;
            }
            String likePattern = "%" + searchTerm.toLowerCase() + "%";
            return cb.like(cb.lower(root.get("name")), likePattern);
        };
    }
}