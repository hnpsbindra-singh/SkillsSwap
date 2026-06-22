package com.example.demo.Models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Messages {
    @Id
    private String id;
    @Indexed
    private String roomKey;
    private String senderId;
    private String receiverId;
    private String content;
    private LocalDateTime sentAt = LocalDateTime.now();
}
