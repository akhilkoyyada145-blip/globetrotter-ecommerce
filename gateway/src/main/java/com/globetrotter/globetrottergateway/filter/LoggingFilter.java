package com.globetrotter.globetrottergateway.filter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Component
public class LoggingFilter implements GlobalFilter, Ordered {

    private static final Logger log = LoggerFactory.getLogger(LoggingFilter.class);
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();

        long startTime = System.currentTimeMillis();
        String timestamp = LocalDateTime.now().format(DATE_FORMATTER);

        String method = request.getMethod().toString();
        String path = request.getURI().getPath();
        String clientIp = getClientIp(exchange);
        String userAgent = request.getHeaders().getFirst(HttpHeaders.USER_AGENT);

        // Make username final for use in lambda
        String usernameHeader = request.getHeaders().getFirst("X-Username");
        final String username = (usernameHeader != null) ? usernameHeader : "anonymous";

        log.info("🔵 INCOMING REQUEST");
        log.info("   Time: {}", timestamp);
        log.info("   Method: {}", method);
        log.info("   Path: {}", path);
        log.info("   User: {}", username);
        log.info("   IP: {}", clientIp);
        log.info("   User-Agent: {}", userAgent != null ? userAgent : "N/A");

        return chain.filter(exchange).then(Mono.fromRunnable(() -> {
            ServerHttpResponse response = exchange.getResponse();

            long duration = System.currentTimeMillis() - startTime;

            int statusCode = response.getStatusCode() != null
                    ? response.getStatusCode().value()
                    : 0;

            String statusEmoji = getStatusEmoji(statusCode);

            log.info("🟢 RESPONSE SENT");
            log.info("   Status: {} {}", statusCode, statusEmoji);
            log.info("   Duration: {} ms", duration);
            log.info("   Path: {}", path);
            log.info("   User: {}", username);
            log.info("─────────────────────────────────────────────────────");
        }));
    }

    private String getClientIp(ServerWebExchange exchange) {
        ServerHttpRequest request = exchange.getRequest();

        String ip = request.getHeaders().getFirst("X-Forwarded-For");
        if (ip != null && !ip.isEmpty()) {
            return ip.split(",")[0].trim();
        }

        ip = request.getHeaders().getFirst("X-Real-IP");
        if (ip != null && !ip.isEmpty()) {
            return ip;
        }

        if (request.getRemoteAddress() != null) {
            return request.getRemoteAddress().getAddress().getHostAddress();
        }

        return "unknown";
    }

    private String getStatusEmoji(int statusCode) {
        if (statusCode >= 200 && statusCode < 300) {
            return "✅ SUCCESS";
        } else if (statusCode >= 300 && statusCode < 400) {
            return "↪️ REDIRECT";
        } else if (statusCode >= 400 && statusCode < 500) {
            return "⚠️ CLIENT ERROR";
        } else if (statusCode >= 500) {
            return "❌ SERVER ERROR";
        }
        return "❓ UNKNOWN";
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE;
    }
}