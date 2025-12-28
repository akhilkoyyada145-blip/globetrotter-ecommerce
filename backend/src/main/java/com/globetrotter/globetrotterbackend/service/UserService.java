package com.globetrotter.globetrotterbackend.service;

import com.globetrotter.globetrotterbackend.model.User;
import java.util.Optional;

public interface UserService {

    User registerUser(User user);

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    User save(User user);

    Optional<User> findById(Long id);
}