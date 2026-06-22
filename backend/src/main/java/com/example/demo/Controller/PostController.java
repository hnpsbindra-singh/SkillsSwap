package com.example.demo.Controller;

import com.example.demo.DTO.*;
import com.example.demo.Security.VerifiedUser;
import com.example.demo.Service.PostService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
public class PostController {
    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    @PostMapping
    @VerifiedUser
    public PostResponse createAPost(@Valid @RequestBody PostRequest request){
        return postService.createAPost(request);
    }
    @GetMapping
    public List<PostTile> getAllPosts(){
        return postService.getAllPosts();
    }

    @GetMapping("/{postId}")
    @VerifiedUser
    public PostResponse getAPost(@PathVariable String postId){
        return postService.getAPost(postId);
    }
    @GetMapping("/me")
    @VerifiedUser
    public List<PostTile> getMyPosts(){
        return postService.getMyPosts();
    }

    @PutMapping("/Delete/{postId}")
    @VerifiedUser
    public String softDelete(@PathVariable String postId){
        return postService.softDelete(postId);
    }

    @PostMapping("/{postId}/request")
    @VerifiedUser
    public SendResponse sendRequest(@PathVariable String postId, @Valid @RequestBody SendRequest request){
        return postService.sendRequest(postId, request);

    }

    @GetMapping("/search/posts")
    @VerifiedUser
    public List<PostTile> searchPosts(
            @RequestParam String skill
    ){
        return postService.searchPosts(skill);
    }
}
