package com.fintegerllp.authapi.service;


import com.fintegerllp.authapi.dto.RegistrationDto;
import com.fintegerllp.authapi.dto.UserDto;
import com.fintegerllp.authapi.dto.UserProfileDto;
import com.fintegerllp.authapi.repository.model.User;
import com.fintegerllp.authapi.repository.model.UserProfile;
import com.fintegerllp.authapi.repository.UserProfileRepository;
import com.fintegerllp.authapi.repository.UserRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final KeycloakService keycloakService;
    private final ObjectMapper objectMapper;

    /**
     * Registers a new user
     *
     * @param registrationDto Registration data
     * @return UserDto User data
     */
    @Transactional
    public UserDto registerUser(RegistrationDto registrationDto) {
        // Check if user already exists
        if (userRepository.existsByEmail(registrationDto.getEmail())) {
            throw new RuntimeException("Email already in use");
        }

        // Parse name into first and last name
        String[] nameParts = registrationDto.getName().split(" ", 2);
        String firstName = nameParts[0];
        String lastName = nameParts.length > 1 ? nameParts[1] : "";

        // Create user in Keycloak
        String keycloakId = keycloakService.createUser(
                registrationDto.getEmail(),
                registrationDto.getEmail(),
                firstName,
                lastName,
                registrationDto.getPassword()
        );

        if (keycloakId == null) {
            throw new RuntimeException("Failed to create user in Keycloak");
        }

        // Create user in database
        User user = User.builder()
                .keycloakId(keycloakId)
                .name(registrationDto.getName())
                .email(registrationDto.getEmail())
                .build();

        User savedUser = userRepository.save(user);

        // Create empty profile
        UserProfile profile = UserProfile.builder()
                .user(savedUser)
                .profileData("{}")
                .settings("{}")
                .build();

        userProfileRepository.save(profile);

        // Return user DTO
        return mapUserToDto(savedUser);
    }

    /**
     * Gets the current authenticated user
     *
     * @return UserDto User data
     */
    public UserDto getCurrentUser() {
        String keycloakId = getCurrentKeycloakId();

        User user = userRepository.findByKeycloakId(keycloakId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return mapUserToDto(user);
    }

    /**
     * Gets a user profile
     *
     * @return UserProfileDto User profile data
     */
    public UserProfileDto getUserProfile() {
        User user = getCurrentUserEntity();

        UserProfile profile = userProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("User profile not found"));

        try {
            Map<String, Object> profileData = objectMapper.readValue(profile.getProfileData(), Map.class);
            Map<String, Object> settings = objectMapper.readValue(profile.getSettings(), Map.class);

            return UserProfileDto.builder()
                    .userId(user.getId())
                    .profileData(profileData)
                    .settings(settings)
                    .build();
        } catch (JsonProcessingException e) {
            log.error("Error parsing profile JSON: {}", e.getMessage());
            throw new RuntimeException("Error parsing profile data");
        }
    }

    /**
     * Updates a user profile
     *
     * @param profileDto Profile data
     * @return UserProfileDto Updated profile data
     */
    @Transactional
    public UserProfileDto updateUserProfile(UserProfileDto profileDto) {
        User user = getCurrentUserEntity();

        UserProfile profile = userProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("User profile not found"));

        try {
            // Update profile data
            String profileDataJson = objectMapper.writeValueAsString(profileDto.getProfileData());
            String settingsJson = objectMapper.writeValueAsString(profileDto.getSettings());

            profile.setProfileData(profileDataJson);
            profile.setSettings(settingsJson);

            UserProfile savedProfile = userProfileRepository.save(profile);

            // Return updated profile DTO
            Map<String, Object> updatedProfileData = objectMapper.readValue(savedProfile.getProfileData(), Map.class);
            Map<String, Object> updatedSettings = objectMapper.readValue(savedProfile.getSettings(), Map.class);

            return UserProfileDto.builder()
                    .userId(user.getId())
                    .profileData(updatedProfileData)
                    .settings(updatedSettings)
                    .build();
        } catch (JsonProcessingException e) {
            log.error("Error serializing profile JSON: {}", e.getMessage());
            throw new RuntimeException("Error updating profile data");
        }
    }

    /**
     * Gets the current Keycloak user ID from security context
     *
     * @return String Keycloak user ID
     */
    private String getCurrentKeycloakId() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (principal instanceof Jwt) {
            return ((Jwt) principal).getSubject();
        }

        throw new RuntimeException("Not authenticated with Keycloak");
    }

    /**
     * Gets the current user entity
     *
     * @return User entity
     */
    private User getCurrentUserEntity() {
        String keycloakId = getCurrentKeycloakId();

        return userRepository.findByKeycloakId(keycloakId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    /**
     * Maps a user entity to a DTO
     *
     * @param user User entity
     * @return UserDto User DTO
     */
    private UserDto mapUserToDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .build();
    }
}