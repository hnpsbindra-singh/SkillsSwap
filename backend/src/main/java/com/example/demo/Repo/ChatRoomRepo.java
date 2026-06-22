package com.example.demo.Repo;

import com.example.demo.Models.ChatRoom;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatRoomRepo extends MongoRepository<ChatRoom, String> {
    List<ChatRoom> findByParticipantIdsContaining(String participantIds);

    ChatRoom findByRoomKey(String roomkey);
}
