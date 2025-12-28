package com.globetrotter.globetrottergateway.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public class GatewayException extends ResponseStatusException {

    public GatewayException(HttpStatus status, String reason) {
        super(status, reason);
    }

    public GatewayException(HttpStatus status, String reason, Throwable cause) {
        super(status, reason, cause);
    }

    public static GatewayException unauthorized(String message) {
        return new GatewayException(HttpStatus.UNAUTHORIZED, message);
    }

    public static GatewayException forbidden(String message) {
        return new GatewayException(HttpStatus.FORBIDDEN, message);
    }

    public static GatewayException notFound(String message) {
        return new GatewayException(HttpStatus.NOT_FOUND, message);
    }

    public static GatewayException badRequest(String message) {
        return new GatewayException(HttpStatus.BAD_REQUEST, message);
    }

    public static GatewayException serviceUnavailable(String message) {
        return new GatewayException(HttpStatus.SERVICE_UNAVAILABLE, message);
    }
}