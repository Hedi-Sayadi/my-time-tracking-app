package com.hedi.timetracking.backend.exception;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

class GlobalExceptionHandlerTest {

  private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

  @Test
  void handleResourceNotFound_shouldReturn404() {
    ResponseEntity<ProblemDetail> result =
        handler.handleResourceNotFound(new ResourceNotFoundException("Project not found"));

    assertThat(result.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    assertThat(result.getBody().getDetail()).isEqualTo("Project not found");
  }

  @Test
  void handleUnauthorized_shouldReturn403() {
    ResponseEntity<ProblemDetail> result =
        handler.handleUnauthorized(new UnauthorizedException("No access"));

    assertThat(result.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    assertThat(result.getBody().getDetail()).isEqualTo("No access");
  }

  @Test
  void handleConflict_shouldReturn409() {
    ResponseEntity<ProblemDetail> result =
        handler.handleConflict(new ConflictException("Already exists"));

    assertThat(result.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
    assertThat(result.getBody().getDetail()).isEqualTo("Already exists");
  }

  @Test
  void handleBadCredentials_shouldReturn401() {
    ResponseEntity<ProblemDetail> result =
        handler.handleBadCredentials(new BadCredentialsException("invalid"));

    assertThat(result.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    assertThat(result.getBody().getDetail()).isEqualTo("Invalid username or password");
  }

  @Test
  @SuppressWarnings("unchecked")
  void handleValidation_shouldReturn400WithErrors() {
    BeanPropertyBindingResult bindingResult = new BeanPropertyBindingResult(new Object(), "obj");
    bindingResult.addError(new FieldError("obj", "name", "must not be blank"));

    MethodArgumentNotValidException ex = mock(MethodArgumentNotValidException.class);
    when(ex.getBindingResult()).thenReturn(bindingResult);

    ResponseEntity<ProblemDetail> result = handler.handleValidation(ex);

    assertThat(result.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    Map<String, String> errors =
        (Map<String, String>) result.getBody().getProperties().get("errors");
    assertThat(errors).containsEntry("name", "must not be blank");
  }

  @Test
  void handleGeneric_shouldReturn500() {
    ResponseEntity<ProblemDetail> result = handler.handleGeneric(new RuntimeException("boom"));

    assertThat(result.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
    assertThat(result.getBody().getDetail()).isEqualTo("An unexpected error occurred");
  }
}
