package com.hedi.timetracking.backend.controller;

import com.hedi.timetracking.backend.TestcontainersConfiguration;
import com.hedi.timetracking.backend.dto.AuthResponse;
import com.hedi.timetracking.backend.dto.LoginRequest;
import com.hedi.timetracking.backend.dto.RegisterRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.context.annotation.Import;
import org.springframework.http.*;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Import(TestcontainersConfiguration.class)
@ActiveProfiles("test")
class AuthControllerIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    private String baseUrl;

    @BeforeEach
    void setUp() {
        baseUrl = "/api/auth";
    }

    @Test
    void register_shouldCreateUserAndReturnToken() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("testuser");
        request.setEmail("test@example.com");
        request.setPassword("password123");

        ResponseEntity<AuthResponse> response = restTemplate.postForEntity(
                baseUrl + "/register", request, AuthResponse.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getToken()).isNotBlank();
        assertThat(response.getBody().getUser().getUsername()).isEqualTo("testuser");
    }

    @Test
    void register_withDuplicateUsername_shouldReturnConflict() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("dupuser");
        request.setEmail("dup1@example.com");
        request.setPassword("password123");
        restTemplate.postForEntity(baseUrl + "/register", request, AuthResponse.class);

        RegisterRequest request2 = new RegisterRequest();
        request2.setUsername("dupuser");
        request2.setEmail("dup2@example.com");
        request2.setPassword("password123");

        ResponseEntity<AuthResponse> response = restTemplate.postForEntity(
                baseUrl + "/register", request2, AuthResponse.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
    }

    @Test
    void login_withValidCredentials_shouldReturnToken() {
        RegisterRequest reg = new RegisterRequest();
        reg.setUsername("loginuser");
        reg.setEmail("login@example.com");
        reg.setPassword("password123");
        restTemplate.postForEntity(baseUrl + "/register", reg, AuthResponse.class);

        LoginRequest request = new LoginRequest();
        request.setUsername("loginuser");
        request.setPassword("password123");

        ResponseEntity<AuthResponse> response = restTemplate.postForEntity(
                baseUrl + "/login", request, AuthResponse.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getToken()).isNotBlank();
    }

    @Test
    void login_withInvalidCredentials_shouldReturnUnauthorized() {
        LoginRequest request = new LoginRequest();
        request.setUsername("nonexistent");
        request.setPassword("wrong");

        ResponseEntity<AuthResponse> response = restTemplate.postForEntity(
                baseUrl + "/login", request, AuthResponse.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

}
