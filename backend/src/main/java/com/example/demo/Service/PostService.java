package com.example.demo.Service;

import com.example.demo.DTO.*;
import com.example.demo.Models.BarterPost;
import com.example.demo.Models.BarterRequest;
import com.example.demo.Models.Status;
import com.example.demo.Models.Users;
import com.example.demo.Repo.BarterRequestRepo;
import com.example.demo.Repo.PostRepo;
import com.example.demo.Repo.UserRepo;
import com.example.demo.Security.ProjectUtils;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class PostService {

    private final ProjectUtils projectUtils;
    private final UserRepo userRepo;
    private final PostRepo postRepo;
    private final BarterRequestRepo barterRequestRepo;

    public PostService(ProjectUtils projectUtils, UserRepo userRepo, PostRepo postRepo, BarterRequestRepo barterRequestRepo) {
        this.projectUtils = projectUtils;
        this.userRepo = userRepo;
        this.postRepo = postRepo;
        this.barterRequestRepo = barterRequestRepo;
    }

    public PostResponse createAPost(@Valid PostRequest request) {
        Users user = projectUtils.getCurrent();
        BarterPost post = new BarterPost();
        post.setTitle(request.getTitle());
        post.setSkillsWanted(request.getSkillsWanted().stream()
                .map(skill -> skill.trim().toUpperCase())
                .toList());
        post.setSkillsOffered(user.getSkillsOffered());
        post.setDescription(request.getDescription());
        post.setCreatorId(user.getId());
        BarterPost saved = postRepo.save(post);
        return mapToPostResponse(saved);

    }

    private PostResponse mapToPostResponse(BarterPost saved) {
        PostResponse response = new PostResponse();
        response.setTitle(saved.getTitle());
        response.setSkillsWanted(saved.getSkillsWanted());
        response.setSkillsOffered(saved.getSkillsOffered());
        response.setId(saved.getId());
        response.setDescription(saved.getDescription());
        response.setCreatorId(saved.getCreatorId());
        Users user = userRepo.findById(saved.getCreatorId())
                .orElseThrow(()->
                        new RuntimeException("Invalid Creator"));
        response.setCreatorName(user.getName());
        response.setCreatedAt(saved.getCreatedAt());
        return response;
    }

    public List<PostTile> getAllPosts() {
        Users user = projectUtils.getCurrent();
        List<BarterPost> posts = postRepo.findAllByActiveIsTrueAndCreatorIdIsNot(user.getId());
        List<PostTile> tiles = new ArrayList<>();
        for (int i = 0; i < posts.size(); i++){
            tiles.add(mapToPostTile(posts.get(i)));
        }
        return tiles;
    }

    private PostTile mapToPostTile(BarterPost barterPost) {
        PostTile tile = new PostTile();
        tile.setId(barterPost.getId());
        tile.setTitle(barterPost.getTitle());
        tile.setSkillsWanted(barterPost.getSkillsWanted());
        tile.setSkillsOffered(barterPost.getSkillsOffered());
        tile.setCreatedAt(barterPost.getCreatedAt());
        Users users = userRepo.findById(barterPost.getCreatorId()).orElseThrow(()->
                new RuntimeException("Invalid User"));
        tile.setCreatorName(users.getName());
        return tile;
    }

    public PostResponse getAPost(String postId) {
        BarterPost post = postRepo.findById(postId)
                .orElseThrow(()->new RuntimeException("Invalid post"));
        if(!post.isActive()){
            throw new RuntimeException("Post not available");
        }
        return mapToPostResponse(post);
    }

    public List<PostTile> getMyPosts() {
        Users user = projectUtils.getCurrent();
        List<BarterPost> posts = postRepo.findAllByCreatorId(user.getId());
        List<PostTile> tiles = new ArrayList<>();
        for (int i = 0; i < posts.size(); i++){
            tiles.add(mapToPostTile(posts.get(i)));
        }
        return tiles;
    }

    public String softDelete(String postId) {
        Users user = projectUtils.getCurrent();
        BarterPost post = postRepo.findById(postId)
                .orElseThrow(()-> new RuntimeException("Invalid post"));
        if(!user.getId().equals(post.getCreatorId())){
            throw new RuntimeException("Invalid Access");
        }
        if(!post.isActive()){
            throw new RuntimeException("Post already deleted");
        }
        post.setActive(false);
        postRepo.save(post);
        return "Delete Success";

    }

    public SendResponse sendRequest(String postId, @Valid SendRequest request) {
        BarterPost post = postRepo.findById(postId)
                .orElseThrow(()->new RuntimeException("Invalid Post"));
        Users user = projectUtils.getCurrent();
        if(post.getCreatorId().equals(user.getId())){
            throw new RuntimeException("Cannot send request to your own post");
        }
        if(!post.isActive()){
            throw new RuntimeException("Post no longer available");
        }
        if(barterRequestRepo.existsByPostIdAndSenderId(
                postId,
                user.getId()
        )){
            throw new RuntimeException("Request already sent");
        }
        BarterRequest barterRequest = new BarterRequest();
        barterRequest.setPostId(postId);
        barterRequest.setStatus(Status.PENDING);
        barterRequest.setSkillsWanted(
                request.getSkillsWanted()
                        .stream()
                        .map(skill -> skill.trim().toUpperCase())
                        .filter(skill -> !skill.isBlank())
                        .toList()
        );
        barterRequest.setSenderId(user.getId());
        barterRequest.setReceiverId(post.getCreatorId());

        BarterRequest saved = barterRequestRepo.save(barterRequest);
        return maptoSendResponse(saved);
    }

    public List<PostTile> searchPosts(String skill){

        skill = skill.trim().toUpperCase();

        Users current = projectUtils.getCurrent();

        List<BarterPost> posts =
                postRepo.findBySkillsOfferedContainingAndActiveIsTrueAndCreatorIdIsNot(
                        skill,
                        current.getId()
                );

        List<PostTile> response = new ArrayList<>();

        for(BarterPost post : posts){
            response.add(mapToPostTile(post));
        }

        return response;
    }

    private SendResponse maptoSendResponse(BarterRequest saved) {
        SendResponse response = new SendResponse();
        response.setStatus(saved.getStatus());
        response.setSkillsWanted(saved.getSkillsWanted());
        Users user = userRepo.findById(saved.getSenderId()).orElseThrow(()->
                new RuntimeException("Invalid Sender"));

        response.setSenderName(user.getName());
        response.setSenderId(saved.getSenderId());
        Users user2 = userRepo.findById(saved.getReceiverId()).orElseThrow(()->
                new RuntimeException("Invalid Target"));

        response.setReceiverName(user2.getName());
        response.setReceiverId(saved.getReceiverId());
        response.setPostId(saved.getPostId());
        response.setId(saved.getId());
        response.setCreatedAt(saved.getCreatedAt());
        return response;
    }
}
