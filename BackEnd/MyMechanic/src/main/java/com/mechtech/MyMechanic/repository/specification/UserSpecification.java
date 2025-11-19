package com.mechtech.MyMechanic.repository.specification;

import com.mechtech.MyMechanic.entity.User;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import java.util.ArrayList;
import java.util.List;

public class UserSpecification {

    public static Specification<User> search(String searchTerm) {
        return (root, query, criteriaBuilder) -> {
            if (searchTerm == null || searchTerm.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            String likePattern = "%" + searchTerm.toLowerCase() + "%";
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("username")), likePattern));
            predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("firstName")), likePattern));
            predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("lastName")), likePattern));
            predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("email")), likePattern));
            return criteriaBuilder.or(predicates.toArray(new Predicate[0]));
        };
    }
}