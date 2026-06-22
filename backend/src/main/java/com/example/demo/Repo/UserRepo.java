package com.example.demo.Repo;

import com.example.demo.Models.Users;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepo extends MongoRepository<Users, String> {
    Users findByUsername(String username);

    boolean existsByUsername(@Email @NotBlank String username);
}
