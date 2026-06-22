package com.example.demo.Models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChatRoom {
    @Id
    private String id;
    private List<String> participantIds = new ArrayList<>();
    @Indexed(unique = true)
    private String roomKey;
    private String lastMessage;
    private LocalDateTime lastMessageTime;
    private LocalDateTime createdAt = LocalDateTime.now();

}
