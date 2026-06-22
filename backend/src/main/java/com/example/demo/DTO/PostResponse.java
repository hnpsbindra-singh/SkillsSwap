package com.example.demo.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PostResponse {
    private String id;
    private String creatorId;
    private String creatorName;
    private String title;
    private String description;
    private List<String> skillsOffered =new ArrayList<>();
    private List<String> skillsWanted =new ArrayList<>();
    private LocalDateTime createdAt;
}
