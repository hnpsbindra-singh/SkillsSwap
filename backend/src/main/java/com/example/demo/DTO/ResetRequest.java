package com.example.demo.DTO;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ResetRequest {
    @Email
    @NotBlank
    private String username;
    @NotBlank
    @Size(min = 8, max = 15)
    private String newPassword;
    @NotBlank
    private String key;
}
