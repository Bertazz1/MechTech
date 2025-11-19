package com.mechtech.MyMechanic.repository;


import com.mechtech.MyMechanic.entity.User;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;



import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {
    Optional<User> findByUsername(String username);

    @Query("SELECT u.role FROM User u WHERE u.username LIKE :username")
    User.Role findRoleByUsername(String username);

    Optional<User> findByUsernameAndStatus(String username, User.Status status);

    Optional<User> findByPasswordResetToken(String token);
}
