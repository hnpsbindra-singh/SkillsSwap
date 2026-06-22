package com.example.demo.DTO;

import com.example.demo.Models.Status;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SendResponse {
    private String id;
    private String postId;
    private String senderName;
    private String senderId;
    private String receiverName;
    private String receiverId;
    private List<String> skillsWanted =new ArrayList<>();
    private Status status;
    private LocalDateTime createdAt = LocalDateTime.now();
}
