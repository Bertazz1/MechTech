package com.mechtech.MyMechanic.repository.specification;

import com.mechtech.MyMechanic.entity.RepairService;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import java.util.ArrayList;
import java.util.List;

public class RepairServiceSpecification {

    public static Specification<RepairService> search(String searchTerm) {
        return (root, query, criteriaBuilder) -> {
            if (searchTerm == null || searchTerm.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            String likePattern = "%" + searchTerm.toLowerCase() + "%";
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), likePattern));
            predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("description")), likePattern));
            return criteriaBuilder.or(predicates.toArray(new Predicate[0]));
        };
    }
}