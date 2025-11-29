package com.mechtech.MyMechanic.repository;


import com.mechtech.MyMechanic.entity.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


import java.util.Optional;

import java.util.List;

public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {


    @Query("SELECT u.role FROM User u WHERE u.email = :email")
    User.Role findRoleByEmail(@Param("email") String email);

    Optional<User> findByPasswordResetToken(String token);

    Optional<User> findByEmail(@NotBlank(message = "O e-mail é obrigatório") @Email(message = "E-mail inválido") String email);

    @Query(value = "SELECT * FROM users WHERE email = :email", nativeQuery = true)
    Optional<User> findByEmailIgnoringTenant(@Param("email") String email);

    @Query(value = "SELECT * FROM users", nativeQuery = true)
    Page<User> findAllIgnoringTenant(Pageable pageable);
}
