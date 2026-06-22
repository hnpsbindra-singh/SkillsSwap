package com.example.demo.Service;

import com.example.demo.DTO.ProfileResponse;
import com.example.demo.DTO.UpdateProfileRequest;
import com.example.demo.DTO.UserDetailsWindow;
import com.example.demo.Models.Users;
import com.example.demo.Repo.UserRepo;
import com.example.demo.Security.ProjectUtils;
import jakarta.validation.Valid;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;

@Service
public class ProfileService {
    private final ProjectUtils projectUtils;
    private final UserRepo userRepo;

    public ProfileService(ProjectUtils projectUtils, UserRepo userRepo) {
        this.projectUtils = projectUtils;
        this.userRepo = userRepo;
    }

    public ProfileResponse getMySelf() {
        Users user = projectUtils.getCurrent();
        return mapToProfileResponse(user);
    }

    private ProfileResponse mapToProfileResponse(Users user) {
        ProfileResponse response = new ProfileResponse();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setSkillsOffered(user.getSkillsOffered());
        response.setRole(user.getRole());
        response.setRecoveryCode(user.getRecoveryCode());
        if (user.getProfilePic() != null) {
            response.setProfilePic(
                    Base64.getEncoder().encodeToString(user.getProfilePic())
            );
        }
        response.setName(user.getName());
        response.setVerified(user.isVerified());
        response.setBio(user.getBio());
        return response;
    }
    public String uploadProfilePicture(MultipartFile image) throws IOException {

        Users user = projectUtils.getCurrent();

        if(image == null || image.isEmpty()){
            throw new RuntimeException("Image is required");
        }

        user.setProfilePic(image.getBytes());

        userRepo.save(user);

        return "Profile picture uploaded successfully";
    }

    public ProfileResponse updateProfile(@Valid UpdateProfileRequest request) throws IOException {
        Users user = projectUtils.getCurrent();

        user.setSkillsOffered(
                request.getSkillsOffered()
                        .stream()
                        .map(skill -> skill.trim().toUpperCase())
                        .toList()
        );
      /*  if (profilePic != null &&
                !profilePic.isEmpty()) {

            user.setProfilePic(profilePic.getBytes());
        }*/

        user.setBio(request.getBio());
        user.setName(request.getName());
        user.setRecoveryCode(request.getRecoveryCode());
        user.setVerified(
                request.getBio() != null &&
                        !request.getBio().trim().isBlank() &&
                        !request.getSkillsOffered().isEmpty()
        );
        userRepo.save(user);

        return mapToProfileResponse(user);


    }

    public UserDetailsWindow getUserTile(String userId) {
        Users user = userRepo.findById(userId).orElseThrow(
                ()-> new RuntimeException("Invalid User")
        );
        UserDetailsWindow tile = mapToTile(user);
        return tile;
    }

    private UserDetailsWindow mapToTile(Users user) {
        UserDetailsWindow tile = new UserDetailsWindow();
        tile.setId(user.getId());
        tile.setName(user.getName());
        tile.setSkillsOffered(user.getSkillsOffered());
        if (user.getProfilePic() != null) {
            tile.setProfilePic(
                    Base64.getEncoder().encodeToString(user.getProfilePic())
            );
        }
        tile.setBio(user.getBio());
        tile.setUsername(user.getUsername());
        return tile;
    }
}
