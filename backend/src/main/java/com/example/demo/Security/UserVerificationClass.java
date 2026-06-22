package com.example.demo.Security;

import com.example.demo.Models.Users;
import com.example.demo.Repo.UserRepo;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class UserVerificationClass {
    @Autowired
    UserRepo userRepo;
    @Before("@annotation(com.example.demo.Security.VerifiedUser)")
    public void checkVerification() {
        Authentication authentication = SecurityContextHolder
                .getContext()
                .getAuthentication();
        String username = authentication.getName();
        Users user = userRepo.findByUsername(username);
        if (user==null) throw new RuntimeException("Invalid access");
        if (!user.isVerified()){
            throw new RuntimeException("Complete the profile by " +
                    "adding Bio, Skills in profile section ");
        }
    }
}
