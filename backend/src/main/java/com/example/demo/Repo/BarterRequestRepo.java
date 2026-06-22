package com.example.demo.Repo;

import com.example.demo.Models.BarterRequest;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BarterRequestRepo extends MongoRepository<BarterRequest, String> {
    boolean existsByPostIdAndSenderId(String postId, String id);

    List<BarterRequest> findAllBySenderIdOrderByCreatedAtDesc(String senderId);

    List<BarterRequest> findAllByReceiverIdOrderByCreatedAtDesc(String id);
}
