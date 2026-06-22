package com.example.demo.Models;

import jakarta.validation.constraints.NotBlank;
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

public class BarterRequest {
    @Id
    private String id;
    private String postId;
    @NotBlank
    private String senderId;
    private String receiverId;
    @NotBlank
    private List<String> skillsWanted =new ArrayList<>();
    private Status status;
    private LocalDateTime createdAt = LocalDateTime.now();

}
