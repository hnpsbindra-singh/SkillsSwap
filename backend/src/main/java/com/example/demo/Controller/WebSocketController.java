package com.example.demo.Controller;

import com.example.demo.DTO.SendMessageRequest;
import com.example.demo.Service.ChatService;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

@Controller
public class WebSocketController {
    private final ChatService chatService;

    public WebSocketController(ChatService chatService) {
        this.chatService = chatService;
    }
    @MessageMapping("/chat/send/{targetUserId}")
    public void sendMessage(
            @DestinationVariable String targetUserId,
            SendMessageRequest request
    ){
        chatService.sendMessage(
                targetUserId,
                request
        );
    }
}
