package com.example.demo.Controller;

import com.example.demo.Models.BarterPost;
import com.example.demo.Models.Users;
import com.example.demo.Repo.PostRepo;
import com.example.demo.Repo.UserRepo;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    private final UserRepo userRepo;
    private final PostRepo postRepo;

    public AdminController(UserRepo userRepo, PostRepo postRepo) {
        this.userRepo = userRepo;
        this.postRepo = postRepo;
    }

    @GetMapping("/users")
    public List<Users> getAllUsers(){
        return userRepo.findAll();
    }

    @GetMapping("/posts")
    public List<BarterPost> getAllPosts(){
        return postRepo.findAll();
    }
}
