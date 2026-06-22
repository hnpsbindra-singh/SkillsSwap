package com.example.demo.Service;

import com.example.demo.DTO.ChatTile;
import com.example.demo.DTO.MessageDTO;
import com.example.demo.DTO.SendMessageRequest;
import com.example.demo.Models.ChatRoom;
import com.example.demo.Models.Messages;
import com.example.demo.Models.Users;
import com.example.demo.Repo.ChatRoomRepo;
import com.example.demo.Repo.MessageRepo;
import com.example.demo.Repo.UserRepo;
import com.example.demo.Security.ProjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
public class ChatService {
    private final ChatRoomRepo chatRoomRepo;
    private final ProjectUtils projectUtils;
    private final UserRepo userRepo;
    private final MessageRepo messageRepo;
    @Autowired
    SimpMessagingTemplate messagingTemplate;

    public ChatService(ChatRoomRepo chatRoomRepo, ProjectUtils projectUtils, UserRepo userRepo, MessageRepo messageRepo) {
        this.chatRoomRepo = chatRoomRepo;
        this.projectUtils = projectUtils;
        this.userRepo = userRepo;
        this.messageRepo = messageRepo;
    }

    public List<ChatTile> getAllChats() {
        Users user = projectUtils.getCurrent();
        List<ChatRoom> chatRooms = chatRoomRepo.findByParticipantIdsContaining(user.getId());
        List<ChatTile> res = new ArrayList<>();
        for (int i = 0; i < chatRooms.size(); i++) {
            res.add(mapToChatTileResponse(chatRooms.get(i)));
        }
        return res;
    }

    private ChatTile mapToChatTileResponse(ChatRoom chatRoom) {
        ChatTile chatTile = new ChatTile();
        chatTile.setRoomKey(chatRoom.getRoomKey());
        List<String> users = chatRoom.getParticipantIds();
        Users current = projectUtils.getCurrent();
        String other = null;
        for (int i = 0; i < users.size(); i++) {
            if(!Objects.equals(users.get(i), current.getId())){
                other = users.get(i);
                break;
            }
        }
        Users user2 = userRepo.findById(other).orElseThrow(()->
                new RuntimeException("Invalid User"));
        chatTile.setOtherUserName(user2.getName());
        chatTile.setOtherUserId(user2.getId());
        chatTile.setLastMessage(chatRoom.getLastMessage());
        chatTile.setLastMessageTime(chatRoom.getLastMessageTime());
        return chatTile;
    }

    public List<MessageDTO> getMessages(String roomkey) {

        ChatRoom room = chatRoomRepo.findByRoomKey(roomkey);
        Users current = projectUtils.getCurrent();
        if(room == null){
            throw new RuntimeException("Invalid Room");
        }
        if(!room.getParticipantIds().contains(current.getId())){
            throw new RuntimeException("Invalid Access");
        }
        List<Messages> messages = messageRepo.findAllByRoomKeyOrderBySentAtAsc(roomkey);
        List<MessageDTO>  res = new ArrayList<>();
        for (int i = 0; i < messages.size(); i++) {
            res.add(mapToMessageDTO(messages.get(i)));
        }
        return res;

    }

    private MessageDTO mapToMessageDTO(Messages message){

        MessageDTO dto = new MessageDTO();

        Users sender = userRepo.findById(message.getSenderId())
                .orElseThrow(() ->
                        new RuntimeException("Invalid Sender"));

        dto.setSenderName(sender.getName());
        dto.setContent(message.getContent());
        dto.setSentAt(message.getSentAt());

        return dto;
    }

    public void sendMessage(
            String targetUserId,
            SendMessageRequest request
    ) {
        if(request.getContent() == null ||
                request.getContent().isBlank()){
            throw new RuntimeException("Message cannot be empty");
        }
        Users receiver = userRepo.findById(targetUserId)
                .orElseThrow(() ->
                        new RuntimeException("Invalid User"));
        Users sender = userRepo.findById(request.getSenderId())
                .orElseThrow(()-> new RuntimeException("Invalid"));
        if(sender.getId().equals(targetUserId)){
            throw new RuntimeException("Cannot chat with yourself");
        }
        String roomKey = projectUtils.generateRoomKey(
                sender.getId(),
                targetUserId
        );
        ChatRoom room = chatRoomRepo.findByRoomKey(roomKey);
        if(room == null){
            room = new ChatRoom();
            room.setRoomKey(roomKey);
            room.setParticipantIds(
                    List.of(
                            sender.getId(),
                            targetUserId
                    )
            );
            chatRoomRepo.save(room);
        }
        if(!room.getParticipantIds().contains(sender.getId())){
            throw new RuntimeException("Invalid Access");
        }
        Messages message = new Messages();
        message.setRoomKey(roomKey);
        message.setSenderId(sender.getId());
        message.setReceiverId(targetUserId);
        message.setContent(request.getContent());
        Messages saved = messageRepo.save(message);
        room.setLastMessage(saved.getContent());
        room.setLastMessageTime(saved.getSentAt());
        chatRoomRepo.save(room);
        MessageDTO dto = mapToMessageDTO(saved);
        messagingTemplate.convertAndSend(
                "/topic/chat/" + roomKey,
                dto
        );
    }
}
