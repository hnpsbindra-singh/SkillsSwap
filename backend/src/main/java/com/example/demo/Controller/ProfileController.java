package com.example.demo.Controller;

import com.example.demo.DTO.ProfileResponse;
import com.example.demo.DTO.UpdateProfileRequest;
import com.example.demo.DTO.UserDetailsWindow;
import com.example.demo.Security.VerifiedUser;
import com.example.demo.Service.ProfileService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {
    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping("/me")
    public ProfileResponse getMySelf(){
        return profileService.getMySelf();
    }
    @PutMapping("/me")
    public ProfileResponse updateProfile(@Valid  @RequestBody UpdateProfileRequest request) throws IOException {
        return profileService.updateProfile(request);
    }

    @PostMapping("/picture")
    @VerifiedUser
    public String uploadProfilePicture(
            @RequestParam("image") MultipartFile image
    ) throws IOException {

        return profileService.uploadProfilePicture(image);
    }

    @GetMapping("/{userId}")
    @VerifiedUser
    public UserDetailsWindow getUserTile(@PathVariable String userId){
        return profileService.getUserTile(userId);
    }



}
