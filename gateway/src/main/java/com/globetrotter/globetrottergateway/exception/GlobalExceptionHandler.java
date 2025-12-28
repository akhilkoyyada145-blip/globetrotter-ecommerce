package com.globetrotter.globetrottergateway.exception;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.globetrotter.globetrottergateway.dto.ErrorResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.web.reactive.error.ErrorWebExceptionHandler;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.util.UUID;

@Component
@Order(-2)
public class GlobalExceptionHandler implements ErrorWebExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public Mono<Void> handle(ServerWebExchange exchange, Throwable ex) {

        // Generate correlation ID for tracking
        String correlationId = UUID.randomUUID().toString();

        // Determine status and message
        HttpStatus status;
        String message;
        String error;

        if (ex instanceof ResponseStatusException) {
            ResponseStatusException rse = (ResponseStatusException) ex;
            status = (HttpStatus) rse.getStatusCode();
            message = rse.getReason() != null ? rse.getReason() : status.getReasonPhrase();
            error = status.getReasonPhrase();
        } else if (ex instanceof org.springframework.web.server.ServerWebInputException) {
            status = HttpStatus.BAD_REQUEST;
            message = "Invalid request: " + ex.getMessage();
            error = "Bad Request";
        } else if (ex.getCause() instanceof java.net.ConnectException) {
            status = HttpStatus.SERVICE_UNAVAILABLE;
            message = "Backend service is unavailable. Please try again later.";
            error = "Service Unavailable";
        } else if (ex instanceof java.util.concurrent.TimeoutException) {
            status = HttpStatus.GATEWAY_TIMEOUT;
            message = "Request timeout. The backend service took too long to respond.";
            error = "Gateway Timeout";
        } else {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
            message = "An unexpected error occurred. Please try again later.";
            error = "Internal Server Error";
        }

        // Log the error
        log.error("❌ ERROR - Correlation ID: {} - Status: {} - Path: {} - Message: {}",
                correlationId, status.value(), exchange.getRequest().getPath(), message, ex);

        // Build error response
        ErrorResponse errorResponse = ErrorResponse.of(
                status.value(),
                error,
                message,
                exchange.getRequest().getPath().value(),
                correlationId
        );

        // Set response status and headers
        exchange.getResponse().setStatusCode(status);
        exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);

        // Write error response
        byte[] bytes;
        try {
            bytes = objectMapper.writeValueAsBytes(errorResponse);
        } catch (JsonProcessingException e) {
            log.error("Error serializing error response", e);
            bytes = "{\"success\":false,\"message\":\"Error processing error response\"}".getBytes(StandardCharsets.UTF_8);
        }

        DataBuffer buffer = exchange.getResponse().bufferFactory().wrap(bytes);
        return exchange.getResponse().writeWith(Mono.just(buffer));
    }
}