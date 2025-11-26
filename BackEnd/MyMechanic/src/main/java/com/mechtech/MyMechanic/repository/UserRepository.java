package com.mechtech.MyMechanic.repository;


import com.mechtech.MyMechanic.entity.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {

    Optional<User> findByFullName(String fullname);

    @Query("SELECT u.role FROM User u WHERE u.email = :email")
    User.Role findRoleByEmail(@Param("email") String email);

    Optional<User> findByEmailAndStatus(String email, User.Status status);

    Optional<User> findByPasswordResetToken(String token);

    Optional<Object> findByEmail(@NotBlank(message = "O e-mail é obrigatório") @Email(message = "E-mail inválido") String adminEmail);
}
