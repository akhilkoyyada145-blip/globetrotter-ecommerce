package com.globetrotter.globetrottergateway.filter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.globetrotter.globetrottergateway.dto.ErrorResponse;
import com.globetrotter.globetrottergateway.util.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.List;

@Component
public class JwtAuthenticationFilter extends AbstractGatewayFilterFactory<JwtAuthenticationFilter.Config> {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    @Autowired
    private JwtUtil jwtUtil;

    public JwtAuthenticationFilter() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();
            log.debug("JWT Authentication Filter - Path: {}", request.getPath());

            if (!request.getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                log.warn("Missing Authorization header");
                return onError(exchange, "Missing Authorization header", HttpStatus.UNAUTHORIZED);
            }

            String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                log.warn("Invalid Authorization header format");
                return onError(exchange, "Invalid Authorization header format", HttpStatus.UNAUTHORIZED);
            }

            String token = authHeader.substring(7);
            if (!jwtUtil.validateToken(token)) {
                log.warn("Invalid JWT token");
                return onError(exchange, "Invalid or expired token", HttpStatus.UNAUTHORIZED);
            }

            try {
                String username = jwtUtil.getUsernameFromToken(token);
                List<String> roles = jwtUtil.getRolesFromToken(token);

                // Convert roles list to comma-separated string
                String rolesHeader = roles != null && !roles.isEmpty()
                        ? String.join(",", roles)
                        : "ROLE_CUSTOMER";

                ServerHttpRequest modifiedRequest = exchange.getRequest().mutate()
                        .header("X-Username", username)
                        .header("X-User-Roles", rolesHeader)
                        .build();

                log.debug("JWT validated for user: {} with roles: {}", username, rolesHeader);
                return chain.filter(exchange.mutate().request(modifiedRequest).build());
            } catch (Exception e) {
                log.error("Error processing JWT: {}", e.getMessage());
                return onError(exchange, "Invalid token", HttpStatus.UNAUTHORIZED);
            }
        };
    }

    private Mono<Void> onError(ServerWebExchange exchange, String message, HttpStatus httpStatus) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(httpStatus);
        response.getHeaders().add("Content-Type", "application/json");

        ErrorResponse errorResponse = ErrorResponse.of(
                httpStatus.value(),
                httpStatus.getReasonPhrase(),
                message,
                exchange.getRequest().getPath().value()
        );

        try {
            ObjectMapper mapper = new ObjectMapper();
            String json = mapper.writeValueAsString(errorResponse);
            return response.writeWith(Mono.just(response.bufferFactory().wrap(json.getBytes())));
        } catch (Exception e) {
            String fallback = String.format("{\"success\": false, \"message\": \"%s\"}", message);
            return response.writeWith(Mono.just(response.bufferFactory().wrap(fallback.getBytes())));
        }
    }

    public static class Config {
    }
}