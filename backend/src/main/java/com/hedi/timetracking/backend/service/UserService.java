package com.hedi.timetracking.backend.service;

import com.hedi.timetracking.backend.dto.*;
import com.hedi.timetracking.backend.exception.ConflictException;
import com.hedi.timetracking.backend.exception.ResourceNotFoundException;
import com.hedi.timetracking.backend.model.Task;
import com.hedi.timetracking.backend.model.User;
import com.hedi.timetracking.backend.repository.TaskRepository;
import com.hedi.timetracking.backend.repository.UserRepository;
import com.hedi.timetracking.backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final TaskRepository taskRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ConflictException("Username already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email already registered");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .build();

        user = userRepository.save(user);

        UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
                .password(user.getPasswordHash())
                .roles("USER")
                .build();

        String token = jwtUtil.generateToken(userDetails);
        return new AuthResponse(token, mapToDto(user));
    }

    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );
        } catch (BadCredentialsException e) {
            throw new BadCredentialsException("Invalid username or password");
        }

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
                .password(user.getPasswordHash())
                .roles("USER")
                .build();

        String token = jwtUtil.generateToken(userDetails);
        return new AuthResponse(token, mapToDto(user));
    }

    public UserDto getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return mapToDto(user);
    }

    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Current password is incorrect");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Transactional
    public UserDto updateTimezone(TimezoneRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setTimezone(request.getTimezone());
        user = userRepository.save(user);
        return mapToDto(user);
    }

    @Transactional(readOnly = true)
    public WeeklyGoalDto getWeeklyGoal() {
        Long userId = getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        java.time.ZoneId zone = user.getTimezone() != null
                ? java.time.ZoneId.of(user.getTimezone())
                : java.time.ZoneId.systemDefault();

        java.time.LocalDate today = java.time.LocalDate.now(zone);
        java.time.LocalDate monday = today.with(java.time.DayOfWeek.MONDAY);
        java.time.LocalDate sunday = today.with(java.time.DayOfWeek.SUNDAY);

        java.time.Instant weekStart = monday.atStartOfDay(zone).toInstant();
        java.time.Instant weekEnd = sunday.plusDays(1).atStartOfDay(zone).toInstant();

        long spentSeconds = taskRepository.findByUserId(userId).stream()
                .filter(t -> !t.getStartTime().isBefore(weekStart) && t.getStartTime().isBefore(weekEnd))
                .mapToLong(Task::getDurationSeconds)
                .sum();

        int targetHours = user.getWeeklyTargetHours() != null ? user.getWeeklyTargetHours() : 0;
        double progressPercent = targetHours > 0
                ? (spentSeconds / 3600.0 / targetHours) * 100
                : 0;

        WeeklyGoalDto dto = new WeeklyGoalDto();
        dto.setTargetHours(targetHours);
        dto.setSpentSeconds(spentSeconds);
        dto.setProgressPercent(progressPercent);
        dto.setWeekStart(monday.toString());
        dto.setWeekEnd(sunday.toString());
        return dto;
    }

    @Transactional
    public UserDto updateWeeklyTarget(Integer targetHours) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setWeeklyTargetHours(targetHours);
        user = userRepository.save(user);
        return mapToDto(user);
    }

    private UserDto mapToDto(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setTimezone(user.getTimezone());
        dto.setWeeklyTargetHours(user.getWeeklyTargetHours());
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
    }

    private Long getCurrentUserId() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"))
                .getId();
    }

}
