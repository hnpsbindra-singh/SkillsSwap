package com.example.demo.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserDetailsWindow {
    private String id;
    private String name;
    private String username;
    private String bio;
    private String profilePic;
    private List<String> skillsOffered =new ArrayList<>();
}
