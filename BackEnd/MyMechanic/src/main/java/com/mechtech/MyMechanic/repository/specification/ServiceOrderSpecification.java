package com.mechtech.MyMechanic.repository.specification;

import com.mechtech.MyMechanic.entity.Client;
import com.mechtech.MyMechanic.entity.ServiceOrder;
import com.mechtech.MyMechanic.entity.ServiceOrderServiceItem;
import com.mechtech.MyMechanic.entity.Vehicle;
import com.mechtech.MyMechanic.web.dto.report.ServiceOrderFilter;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
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
            predicates.add(criteriaBuilder.like(criteriaBuilder.lower(vehicleJoin.get("model").get("name")), likePattern));
            predicates.add(criteriaBuilder.like(criteriaBuilder.lower(vehicleJoin.get("model").get("brand").get("name")), likePattern));


            return criteriaBuilder.or(predicates.toArray(new Predicate[0]));
        };

    }

    public static Specification<ServiceOrder> withFilter(ServiceOrderFilter filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Filtro por Data (considerando início e fim do dia)
            if (filter.getStartDate() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("entryDate"), filter.getStartDate().atStartOfDay()));
            }
            if (filter.getEndDate() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("entryDate"), filter.getEndDate().atTime(23, 59, 59)));
            }

            // Filtro por Cliente
            if (filter.getClientId() != null) {
                predicates.add(cb.equal(root.get("client").get("id"), filter.getClientId()));
            }

            // Filtro por Veículo
            if (filter.getVehicleId() != null) {
                predicates.add(cb.equal(root.get("vehicle").get("id"), filter.getVehicleId()));
            }

            // Filtro por Status
            if (filter.getStatus() != null && !filter.getStatus().isEmpty()) {
                predicates.add(cb.equal(root.get("status"), ServiceOrder.ServiceOrderStatus.valueOf(filter.getStatus())));
            }

            // Filtro por Funcionário (Complexo: Join com itens de serviço)
            if (filter.getEmployeeId() != null) {
                // Join para buscar OSs onde o funcionário realizou pelo menos um serviço
                Join<ServiceOrder, ServiceOrderServiceItem> serviceItemsJoin = root.join("serviceItems", JoinType.INNER);
                predicates.add(cb.equal(serviceItemsJoin.get("employee").get("id"), filter.getEmployeeId()));

                // Group by para evitar duplicatas se o funcionário fez múltiplos serviços na mesma OS
                query.distinct(true);
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}