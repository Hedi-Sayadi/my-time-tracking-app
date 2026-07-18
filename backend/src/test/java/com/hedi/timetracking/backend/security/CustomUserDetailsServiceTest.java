package com.hedi.timetracking.backend.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import com.hedi.timetracking.backend.model.User;
import com.hedi.timetracking.backend.repository.UserRepository;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

@ExtendWith(MockitoExtension.class)
class CustomUserDetailsServiceTest {

  @Mock private UserRepository userRepository;

  @InjectMocks private CustomUserDetailsService customUserDetailsService;

  @Test
  void loadUserByUsername_found_shouldReturnUserDetails() {
    User user = User.builder().id(1L).username("testuser").passwordHash("hash").build();
    when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));

    UserDetails result = customUserDetailsService.loadUserByUsername("testuser");

    assertThat(result.getUsername()).isEqualTo("testuser");
    assertThat(result.getPassword()).isEqualTo("hash");
    assertThat(result.getAuthorities()).hasSize(1);
    assertThat(result.getAuthorities().iterator().next().getAuthority()).isEqualTo("ROLE_USER");
  }

  @Test
  void loadUserByUsername_notFound_shouldThrow() {
    when(userRepository.findByUsername("missing")).thenReturn(Optional.empty());

    assertThatThrownBy(() -> customUserDetailsService.loadUserByUsername("missing"))
        .isInstanceOf(UsernameNotFoundException.class);
  }
}
