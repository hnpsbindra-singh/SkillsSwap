package com.example.demo.DTO;

import com.example.demo.Models.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProfileResponse {
    private String id;
    private String name;
    private String username;
    private Role role;
    private String recoveryCode;
    private String bio;
    private String profilePic;
    private List<String> skillsOffered =new ArrayList<>();
    private boolean verified;
}
