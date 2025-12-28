package com.globetrotter.globetrottergateway.filter;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Slf4j
@Component
public class RateLimitFilter extends AbstractGatewayFilterFactory<RateLimitFilter.Config> {

    // Store request counts per IP
    private final Map<String, AtomicInteger> requestCounts = new ConcurrentHashMap<>();
    private final Map<String, Long> resetTimes = new ConcurrentHashMap<>();

    public RateLimitFilter() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            String clientIp = getClientIp(exchange);

            log.debug("Rate limit check for IP: {} - Route: {}", clientIp, exchange.getRequest().getPath());

            // Get or create counter for this IP
            AtomicInteger counter = requestCounts.computeIfAbsent(clientIp, k -> new AtomicInteger(0));
            Long resetTime = resetTimes.get(clientIp);
            long currentTime = System.currentTimeMillis();

            // Reset counter if time window has passed
            if (resetTime == null || currentTime > resetTime) {
                counter.set(0);
                resetTimes.put(clientIp, currentTime + Duration.ofMinutes(1).toMillis());
            }

            // Increment and check limit
            int currentCount = counter.incrementAndGet();
            int limit = config.getRequestsPerMinute();

            log.debug("Request count for {}: {}/{}", clientIp, currentCount, limit);

            if (currentCount > limit) {
                log.warn("Rate limit exceeded for IP: {} - Count: {}/{}", clientIp, currentCount, limit);
                return rateLimitExceeded(exchange, limit);
            }

            // Add rate limit headers
            exchange.getResponse().getHeaders().add("X-RateLimit-Limit", String.valueOf(limit));
            exchange.getResponse().getHeaders().add("X-RateLimit-Remaining",
                    String.valueOf(Math.max(0, limit - currentCount)));

            return chain.filter(exchange);
        };
    }

    private String getClientIp(ServerWebExchange exchange) {
        // Try to get real IP from headers (for proxies/load balancers)
        String ip = exchange.getRequest().getHeaders().getFirst("X-Forwarded-For");

        if (ip == null || ip.isEmpty()) {
            ip = exchange.getRequest().getHeaders().getFirst("X-Real-IP");
        }

        if (ip == null || ip.isEmpty()) {
            ip = exchange.getRequest().getRemoteAddress() != null
                    ? exchange.getRequest().getRemoteAddress().getAddress().getHostAddress()
                    : "unknown";
        }

        return ip;
    }

    private Mono<Void> rateLimitExceeded(ServerWebExchange exchange, int limit) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
        response.getHeaders().add("Content-Type", "application/json");
        response.getHeaders().add("X-RateLimit-Limit", String.valueOf(limit));
        response.getHeaders().add("X-RateLimit-Remaining", "0");
        response.getHeaders().add("Retry-After", "60");

        String errorResponse = String.format(
                "{\"success\": false, \"message\": \"Rate limit exceeded. Maximum %d requests per minute allowed. Try again in 60 seconds.\", \"limit\": %d}",
                limit, limit
        );

        return response.writeWith(Mono.just(response.bufferFactory().wrap(errorResponse.getBytes())));
    }

    public static class Config {
        private int requestsPerMinute = 100;

        public int getRequestsPerMinute() {
            return requestsPerMinute;
        }

        public void setRequestsPerMinute(int requestsPerMinute) {
            this.requestsPerMinute = requestsPerMinute;
        }
    }
}