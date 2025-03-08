package com.fintegerllp.authapi.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.keycloak.admin.client.resource.RealmResource;
import org.keycloak.admin.client.resource.UsersResource;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import jakarta.ws.rs.core.Response;

@Service
@RequiredArgsConstructor
@Slf4j
public class KeycloakService {

    @Value("${keycloak.auth-server-url}")
    private String serverUrl;

    @Value("${keycloak.realm}")
    private String realm;

    @Value("${keycloak.admin.client-id}")
    private String clientId;

    @Value("${keycloak.admin.username}")
    private String adminUsername;

    @Value("${keycloak.admin.password}")
    private String adminPassword;

    @Value("${keycloak.admin.realm}")
    private String adminRealm;

    /**
     * Creates a user in Keycloak
     *
     * @param username Username (email)
     * @param email Email
     * @param firstName First name
     * @param lastName Last name
     * @param password Password
     * @return String keycloakId if successful, null if failed
     */
    public String createUser(String username, String email, String firstName, String lastName, String password) {
        Keycloak keycloak = getKeycloakInstance();

        // Define user
        UserRepresentation user = new UserRepresentation();
        user.setEnabled(true);
        user.setUsername(username);
        user.setEmail(email);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setEmailVerified(true);

        // Set password credential
        CredentialRepresentation credential = new CredentialRepresentation();
        credential.setType(CredentialRepresentation.PASSWORD);
        credential.setValue(password);
        credential.setTemporary(false);
        user.setCredentials(Collections.singletonList(credential));

        // Get realm
        RealmResource realmResource = keycloak.realm(realm);
        UsersResource usersResource = realmResource.users();

        // Create user
        try (Response response = usersResource.create(user)) {
            if (response.getStatus() == 201) {
                String locationHeader = response.getHeaderString("Location");
                String userId = locationHeader.substring(locationHeader.lastIndexOf("/") + 1);
                log.info("Created Keycloak user with ID: {}", userId);
                return userId;
            } else {
                log.error("Failed to create Keycloak user. Status: {}", response.getStatus());
                return null;
            }
        }
    }

    /**
     * Updates a user in Keycloak
     *
     * @param keycloakId Keycloak user ID
     * @param firstName First name
     * @param lastName Last name
     * @param email Email
     * @return boolean indicating success
     */
    public boolean updateUser(String keycloakId, String firstName, String lastName, String email) {
        Keycloak keycloak = getKeycloakInstance();

        try {
            UserRepresentation user = new UserRepresentation();
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setEmail(email);

            keycloak.realm(realm).users().get(keycloakId).update(user);
            return true;
        } catch (Exception e) {
            log.error("Failed to update Keycloak user: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Gets a user from Keycloak by ID
     *
     * @param keycloakId Keycloak user ID
     * @return UserRepresentation
     */
    public UserRepresentation getUserById(String keycloakId) {
        Keycloak keycloak = getKeycloakInstance();

        try {
            return keycloak.realm(realm).users().get(keycloakId).toRepresentation();
        } catch (Exception e) {
            log.error("Failed to get Keycloak user: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Gets a user from Keycloak by username (email)
     *
     * @param username Username (email)
     * @return UserRepresentation
     */
    public UserRepresentation getUserByUsername(String username) {
        Keycloak keycloak = getKeycloakInstance();

        try {
            List<UserRepresentation> users = keycloak.realm(realm).users().search(username, true);
            return users.isEmpty() ? null : users.get(0);
        } catch (Exception e) {
            log.error("Failed to get Keycloak user: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Deletes a user in Keycloak
     *
     * @param keycloakId Keycloak user ID
     * @return boolean indicating success
     */
    public boolean deleteUser(String keycloakId) {
        Keycloak keycloak = getKeycloakInstance();

        try {
            keycloak.realm(realm).users().delete(keycloakId);
            return true;
        } catch (Exception e) {
            log.error("Failed to delete Keycloak user: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Resets a user's password in Keycloak
     *
     * @param keycloakId Keycloak user ID
     * @param newPassword New password
     * @return boolean indicating success
     */
    public boolean resetPassword(String keycloakId, String newPassword) {
        Keycloak keycloak = getKeycloakInstance();

        try {
            CredentialRepresentation credential = new CredentialRepresentation();
            credential.setType(CredentialRepresentation.PASSWORD);
            credential.setValue(newPassword);
            credential.setTemporary(false);

            keycloak.realm(realm).users().get(keycloakId).resetPassword(credential);
            return true;
        } catch (Exception e) {
            log.error("Failed to reset Keycloak user password: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Gets a Keycloak admin client instance
     *
     * @return Keycloak instance
     */
    private Keycloak getKeycloakInstance() {
        return KeycloakBuilder.builder()
                .serverUrl(serverUrl)
                .realm(adminRealm)
                .clientId(clientId)
                .username(adminUsername)
                .password(adminPassword)
                .build();
    }
}