package com.ecommerce.digitaltricks.shared.exception;

import com.ecommerce.digitaltricks.shared.dto.ApiErrorDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<?> handleNotFound(NotFoundException ex) {
        return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage(), null);
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<?> handleBadRequest(BadRequestException ex) {
        return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), null);
    }

    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<?> handleForbidden(ForbiddenException ex) {
        return buildResponse(HttpStatus.FORBIDDEN, ex.getMessage(), null);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> fields = new HashMap<>();

        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            fields.put(error.getField(), error.getDefaultMessage());
        }

        return buildResponse(HttpStatus.BAD_REQUEST, "Erro de validação", fields);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGeneric(Exception ex) {
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Erro interno do servidor", null);
    }

    private ResponseEntity<Map<String, Object>> buildResponse(HttpStatus status, String message, Object details) {
        Map<String, Object> body = new HashMap<>();
        body.put("status", status.value());
        body.put("error", status.getReasonPhrase());
        body.put("message", message);
        body.put("timestamp", LocalDateTime.now());
        body.put("details", details == null ? Map.of() : details);

        return ResponseEntity.status(status).body(body);
    }

    @ExceptionHandler(CupomValidacaoException.class)
    public ResponseEntity<ApiErrorDTO> handleCupomValidacaoException(CupomValidacaoException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                new ApiErrorDTO(
                        400,
                        "Bad Request",
                        ex.getCode(),
                        ex.getMessage(),
                        LocalDateTime.now(),
                        ex.getReasons(),
                        ex.getDetails()
                )
        );
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiErrorDTO> handleResponseStatusException(ResponseStatusException ex) {
        HttpStatus status = HttpStatus.valueOf(ex.getStatusCode().value());

        return ResponseEntity.status(status).body(
                new ApiErrorDTO(
                        status.value(),
                        status.getReasonPhrase(),
                        "GENERIC_ERROR",
                        ex.getReason() != null ? ex.getReason() : "Erro na requisição",
                        LocalDateTime.now(),
                        List.of(),
                        Map.of()
                )
        );
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiErrorDTO> handleRuntimeException(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                new ApiErrorDTO(
                        400,
                        "Bad Request",
                        "RUNTIME_ERROR",
                        ex.getMessage() != null ? ex.getMessage() : "Erro interno",
                        LocalDateTime.now(),
                        List.of(),
                        Map.of()
                )
        );
    }
}