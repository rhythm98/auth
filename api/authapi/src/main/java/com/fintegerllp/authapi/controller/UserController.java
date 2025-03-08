package com.fintegerllp.authapi.controller;

import com.fintegerllp.authapi.dto.ApiResponseDto;
import com.fintegerllp.authapi.dto.UserProfileDto;
import com.fintegerllp.authapi.exception.ProfileNotFoundException;
import com.fintegerllp.authapi.exception.UserNotFoundException;
import com.fintegerllp.authapi.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Slf4j
//@CrossOrigin(origins = "${app.cors.allowed-origins}", allowCredentials = "true")
public class UserController {

    private final UserService userService;

    /**
     * Get the current user's profile
     *
     * @return ApiResponseDto<UserProfileDto> User profile data
     */
    @GetMapping("/profile")
    public ResponseEntity<ApiResponseDto<UserProfileDto>> getUserProfile() {
        try {
            UserProfileDto profileDto = userService.getUserProfile();
            return ResponseEntity.ok(ApiResponseDto.success(profileDto));
        } catch (UserNotFoundException | ProfileNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error fetching user profile: {}", e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(ApiResponseDto.error("Failed to fetch user profile"));
        }
    }

    /**
     * Update the current user's profile
     *
     * @param profileDto Profile data to update
     * @return ApiResponseDto<UserProfileDto> Updated user profile data
     */
    @PutMapping("/profile")
    public ResponseEntity<ApiResponseDto<UserProfileDto>> updateUserProfile(@RequestBody UserProfileDto profileDto) {
        try {
            UserProfileDto updatedProfile = userService.updateUserProfile(profileDto);
            return ResponseEntity.ok(ApiResponseDto.success("Profile updated successfully", updatedProfile));
        } catch (UserNotFoundException | ProfileNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error updating user profile: {}", e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(ApiResponseDto.error("Failed to update user profile"));
        }
    }
}