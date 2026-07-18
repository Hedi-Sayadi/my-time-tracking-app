package com.hedi.timetracking.backend.security;

import static org.assertj.core.api.Assertions.assertThat;

import com.hedi.timetracking.backend.config.JwtProperties;
import java.util.Collections;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

class JwtUtilTest {

  private JwtUtil jwtUtil;
  private JwtProperties jwtProperties;

  @BeforeEach
  void setUp() {
    jwtProperties = new JwtProperties();
    jwtProperties.setSecret("test-secret-key-test-secret-key-test-secret-key");
    jwtProperties.setExpirationMs(3600000);
    jwtUtil = new JwtUtil(jwtProperties);
  }

  @Test
  void generateToken_and_validateToken_shouldWork() {
    UserDetails userDetails =
        new User(
            "testuser",
            "password",
            Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")));

    String token = jwtUtil.generateToken(userDetails);

    assertThat(token).isNotBlank();
    assertThat(jwtUtil.extractUsername(token)).isEqualTo("testuser");
    assertThat(jwtUtil.validateToken(token, userDetails)).isTrue();
  }

  @Test
  void validateToken_withWrongUser_shouldReturnFalse() {
    UserDetails userDetails =
        new User(
            "user1",
            "password",
            Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")));
    UserDetails wrongUser =
        new User(
            "user2",
            "password",
            Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")));

    String token = jwtUtil.generateToken(userDetails);

    assertThat(jwtUtil.validateToken(token, wrongUser)).isFalse();
  }
}
