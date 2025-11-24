package com.mechtech.MyMechanic.repository.specification;

import com.mechtech.MyMechanic.entity.*;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class InvoiceSpecification {

    public static Specification<Invoice> search(String searchTerm) {
        return (root, query, criteriaBuilder) -> {
            if (searchTerm == null || searchTerm.trim().isEmpty()) {
                // Retorna todos os resultados se o termo de busca for nulo ou vazio
                return criteriaBuilder.conjunction();
            }

            String likePattern = "%" + searchTerm.toLowerCase() + "%";

            Join<Invoice, ServiceOrder> serviceOrderJoin = root.join("serviceOrder");
            Join<ServiceOrder, Client> clientJoin = serviceOrderJoin.join("client");
            Join<ServiceOrder, Vehicle> vehicleJoin = serviceOrderJoin.join("vehicle");

            List<Predicate> predicates = new ArrayList<>();

            predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("invoiceNumber")), likePattern));

            predicates.add(criteriaBuilder.like(criteriaBuilder.lower(clientJoin.get("name")), likePattern));
            predicates.add(criteriaBuilder.like(criteriaBuilder.lower(vehicleJoin.get("licensePlate")), likePattern));

            return criteriaBuilder.or(predicates.toArray(new Predicate[0]));
        };
    }
}