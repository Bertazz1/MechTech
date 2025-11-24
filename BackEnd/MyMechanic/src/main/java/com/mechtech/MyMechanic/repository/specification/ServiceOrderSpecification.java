package com.mechtech.MyMechanic.repository.specification;

import com.mechtech.MyMechanic.entity.Client;
import com.mechtech.MyMechanic.entity.ServiceOrder;
import com.mechtech.MyMechanic.entity.Vehicle;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import java.util.ArrayList;
import java.util.List;

public class ServiceOrderSpecification {


    public static Specification<ServiceOrder> search(String searchTerm) {
        return (root, query, criteriaBuilder) -> {
            if (searchTerm == null || searchTerm.trim().isEmpty()) {
                return criteriaBuilder.conjunction(); // Retorna todos se não houver termo de busca
            }

            String likePattern = "%" + searchTerm.toLowerCase() + "%";

            Join<ServiceOrder, Client> clientJoin = root.join("client");
            Join<ServiceOrder, Vehicle> vehicleJoin = root.join("vehicle");

            List<Predicate> predicates = new ArrayList<>();

            predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("description")), likePattern));
            predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("status")), likePattern));

            predicates.add(criteriaBuilder.like(criteriaBuilder.lower(clientJoin.get("name")), likePattern));
            predicates.add(criteriaBuilder.like(criteriaBuilder.lower(clientJoin.get("email")), likePattern));
            predicates.add(criteriaBuilder.like(criteriaBuilder.lower(vehicleJoin.get("licensePlate")), likePattern));
            predicates.add(criteriaBuilder.like(criteriaBuilder.lower(vehicleJoin.get("model")), likePattern));
            predicates.add(criteriaBuilder.like(criteriaBuilder.lower(vehicleJoin.get("brand")), likePattern));



            return criteriaBuilder.or(predicates.toArray(new Predicate[0]));
        };
    }
}