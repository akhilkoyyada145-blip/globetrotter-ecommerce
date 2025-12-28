package com.globetrotter.globetrotterbackend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Component
public class GatewayAuthenticationFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        // Check if request comes from Gateway
        String username = request.getHeader("X-Username");
        String rolesHeader = request.getHeader("X-User-Roles");

        if (username != null && !username.isEmpty()) {
            // Request from Gateway - trust it!

            // Parse roles from header (comma-separated)
            List<SimpleGrantedAuthority> authorities;
            if (rolesHeader != null && !rolesHeader.isEmpty()) {
                authorities = Stream.of(rolesHeader.split(","))
                        .map(String::trim)
                        .map(SimpleGrantedAuthority::new)
                        .collect(Collectors.toList());
            } else {
                // Default to CUSTOMER role if no roles provided
                authorities = List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER"));
            }

            // Create authentication token
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            username,
                            null,
                            authorities
                    );

            // Set in security context
            SecurityContextHolder.getContext().setAuthentication(authentication);

            System.out.println("✅ Gateway Authentication: User=" + username + ", Roles=" + authorities);
        }

        filterChain.doFilter(request, response);
    }
}