package com.example.demo.Repo;

import com.example.demo.Models.Messages;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepo extends MongoRepository<Messages, String> {
    List<Messages> findAllByRoomKeyOrderBySentAtAsc(String roomKey);
}
