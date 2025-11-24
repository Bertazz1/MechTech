package com.mechtech.MyMechanic.repository.specification;

import com.mechtech.MyMechanic.entity.Client;
import com.mechtech.MyMechanic.entity.Quotation;
import com.mechtech.MyMechanic.entity.Vehicle;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import java.util.ArrayList;
import java.util.List;

public class QuotationSpecification {

    public static Specification<Quotation> search(String searchTerm) {
        return (root, query, criteriaBuilder) -> {
            if (searchTerm == null || searchTerm.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }

            String likePattern = "%" + searchTerm.toLowerCase() + "%";

            Join<Quotation, Client> clientJoin = root.join("client");
            Join<Quotation, Vehicle> vehicleJoin = root.join("vehicle");

            List<Predicate> predicates = new ArrayList<>();
            predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("description")), likePattern));
            predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("status")), likePattern));
            predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("entryDate")), likePattern));

            predicates.add(criteriaBuilder.like(criteriaBuilder.lower(clientJoin.get("name")), likePattern));
            predicates.add(criteriaBuilder.like(criteriaBuilder.lower(clientJoin.get("email")), likePattern));
            predicates.add(criteriaBuilder.like(criteriaBuilder.lower(vehicleJoin.get("licensePlate")), likePattern));
            predicates.add(criteriaBuilder.like(criteriaBuilder.lower(vehicleJoin.get("model")), likePattern));
            predicates.add(criteriaBuilder.like(criteriaBuilder.lower(vehicleJoin.get("brand")), likePattern));



            return criteriaBuilder.or(predicates.toArray(new Predicate[0]));
        };
    }
}