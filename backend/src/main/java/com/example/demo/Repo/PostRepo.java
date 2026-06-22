package com.example.demo.Repo;

import com.example.demo.Models.BarterPost;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepo extends MongoRepository<BarterPost, String> {
    List<BarterPost> findAllByActiveIsTrueAndCreatorIdIsNot(String creatorId);

    List<BarterPost> findAllByCreatorId(String id);


    List<BarterPost> findBySkillsOfferedContainingAndActiveIsTrueAndCreatorIdIsNot(String skill, String id);
}
