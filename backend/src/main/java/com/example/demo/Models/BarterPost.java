package com.example.demo.Models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document
@Data
@AllArgsConstructor
@NoArgsConstructor
public class BarterPost {
    @Id
    private String id;
    private String creatorId;
    private String title;
    private String description;
    private List<String> skillsOffered =new ArrayList<>();
    private List<String> skillsWanted =new ArrayList<>();
    private boolean active = true;
    private LocalDateTime createdAt = LocalDateTime.now();
}
