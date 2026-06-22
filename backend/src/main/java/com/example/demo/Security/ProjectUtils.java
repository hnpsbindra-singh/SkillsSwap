package com.example.demo.Security;

import com.example.demo.Models.Users;
import com.example.demo.Repo.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class ProjectUtils {
    @Autowired
    UserRepo repo;

    public String generateRoomKey(String user1Id, String user2Id){

        if(user1Id.compareTo(user2Id) < 0){
            return user1Id + "_" + user2Id;
        }

        return user2Id + "_" + user1Id;
    }
    public Users getCurrent() {
        Authentication authentication =
                SecurityContextHolder.getContext()
                        .getAuthentication();
        if(authentication == null){
            throw new RuntimeException("Unauthorized");
        }
        String username = authentication.getName();
        Users user = repo.findByUsername(username);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        return user;
    }
    public void userExists(Users user){
        if(user==null) throw new RuntimeException("User Doesn't Exist");
    }
}
