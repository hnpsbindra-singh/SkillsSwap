package com.example.demo.Service;

import com.example.demo.DTO.LoginRequest;
import com.example.demo.DTO.RegisterRequest;
import com.example.demo.DTO.RegisterResponse;
import com.example.demo.DTO.ResetRequest;
import com.example.demo.Models.Role;
import com.example.demo.Models.Users;
import com.example.demo.Repo.UserRepo;
import com.example.demo.Security.JwtUtils;
import com.example.demo.Security.ProjectUtils;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AuthService {
    @Autowired
    PasswordEncoder passwordEncoder;
    @Autowired
    UserRepo userRepo;
    @Autowired
    AuthenticationManager authenticationManager;
    @Autowired
    JwtUtils utils;
    @Autowired
    ProjectUtils projectUtils;
    public RegisterResponse register(RegisterRequest request) {
        Users user = new Users();
        user.setName(request.getName());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setUsername(request.getUsername());
        user.setRole(Role.STUDENT);
        user.setVerified(false);
        String key = UUID.randomUUID()
                .toString()
                .replace("-", "")
                .substring(0, 8)
                .toUpperCase();
        user.setRecoveryCode(key);
        if(userRepo.existsByUsername(request.getUsername())){
            throw new RuntimeException("User already exists");
        }
        Users saved = userRepo.save(user);
        return mapToRegisterResponse(saved);

    }

    private RegisterResponse mapToRegisterResponse(Users saved) {
        RegisterResponse registerResponse = new RegisterResponse();
        registerResponse.setId(saved.getId());
        registerResponse.setName(saved.getName());
        registerResponse.setUsername(saved.getUsername());
        registerResponse.setRecoveryCode(saved.getRecoveryCode());
        return registerResponse;
    }

    public String login(@Valid LoginRequest request) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                request.getUsername(), request.getPassword()
        ));
        Users user = userRepo.findByUsername(request.getUsername());
        if(user == null){
            throw new RuntimeException("User Doesnt exist");
        }
        return utils.generateToken(user.getUsername(), user.getRole());

    }

    public RegisterResponse forgot(@Valid ResetRequest request) {
        Users user = userRepo.findByUsername(request.getUsername());
        projectUtils.userExists(user);
        if(!user.getRecoveryCode().equals(request.getKey())){
            throw new RuntimeException("Invalid Code");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        String key = UUID.randomUUID()
                .toString()
                .replace("-", "")
                .substring(0, 8)
                .toUpperCase();
        user.setRecoveryCode(key);

        Users saved = userRepo.save(user);
        return mapToRegisterResponse(saved);
    }
}
