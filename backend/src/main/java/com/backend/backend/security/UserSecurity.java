package com.backend.backend.security;

import java.util.UUID;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import com.backend.backend.repositories.UserRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class UserSecurity {

    private final UserRepository userRepository;

    public boolean isUserSelf(Authentication authentication, UUID userId) {
        String email = authentication.getName();
        return userRepository.findById(userId)
                .map(user -> user.getEmail().equals(email))
                .orElse(false);
    }
}