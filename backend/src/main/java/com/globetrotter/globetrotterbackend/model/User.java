package com.globetrotter.globetrotterbackend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String username;

    @Column(unique = true, nullable = false, length = 100)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(name = "first_name", length = 50)
    private String firstName;

    @Column(name = "last_name", length = 50)
    private String lastName;

    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private Role role = Role.CUSTOMER;

    @Column(nullable = true)  // CHANGED: Allow NULL
    @Builder.Default
    private Boolean enabled = true;

    @Column(nullable = true)  // CHANGED: Allow NULL
    @Builder.Default
    private Boolean locked = false;

    @Column(name = "failed_login_attempts", nullable = true)  // CHANGED: Allow NULL
    @Builder.Default
    private Integer failedLoginAttempts = 0;

    @Column(name = "lock_time")
    private LocalDateTime lockTime;

    @Column(name = "last_login")
    private LocalDateTime lastLogin;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    @JsonIgnore
    private Cart cart;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    @JsonIgnore
    @Builder.Default
    private List<Order> orders = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    @JsonIgnore
    @Builder.Default
    private List<Review> reviews = new ArrayList<>();

    // Helper methods with NULL checks
    public boolean isEnabled() {
        return enabled != null && enabled;
    }

    public boolean isLocked() {
        return locked != null && locked;
    }

    public int getFailedLoginAttempts() {
        return failedLoginAttempts != null ? failedLoginAttempts : 0;
    }

    public void incrementFailedAttempts() {
        this.failedLoginAttempts = (this.failedLoginAttempts != null ? this.failedLoginAttempts : 0) + 1;
    }

    public void resetFailedAttempts() {
        this.failedLoginAttempts = 0;
    }

    public void lock() {
        this.locked = true;
        this.lockTime = LocalDateTime.now();
    }

    public void unlock() {
        this.locked = false;
        this.lockTime = null;
        this.failedLoginAttempts = 0;
    }

    public enum Role {
        CUSTOMER, ADMIN
    }
}