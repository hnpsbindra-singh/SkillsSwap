package com.example.demo.Controller;

import com.example.demo.DTO.ChatTile;
import com.example.demo.DTO.MessageDTO;
import com.example.demo.Models.Messages;
import com.example.demo.Security.VerifiedUser;
import com.example.demo.Service.ChatService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @GetMapping
    @VerifiedUser
    public List<ChatTile> getAllChats(){
        return chatService.getAllChats();
    }

    @GetMapping("/{roomkey}/messages")
    @VerifiedUser
    public List<MessageDTO> getMessages(@PathVariable String roomkey){
        return chatService.getMessages(roomkey);
    }

}
