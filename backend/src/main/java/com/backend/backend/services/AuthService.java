package com.backend.backend.services;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

import com.backend.backend.dto.AuthenticationRequest;
import com.backend.backend.dto.AuthenticationResponse;
import com.backend.backend.models.User;
import com.backend.backend.repositories.UserRepository;
import com.backend.backend.security.JwtService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

        private final UserRepository userRepository;
        private final JwtService jwtService;
        private final AuthenticationManager authenticationManager;

        public AuthenticationResponse authenticate(AuthenticationRequest request) {
                authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(
                                                request.getEmail(),
                                                request.getPassword()));
                User user = userRepository.findByEmail(request.getEmail())
                                .orElseThrow();
                String jwtToken = jwtService.generateToken(
                                new org.springframework.security.core.userdetails.User(
                                                user.getEmail(),
                                                user.getPassword(),
                                                java.util.Collections.singletonList(
                                                                new org.springframework.security.core.authority.SimpleGrantedAuthority(
                                                                                user.getRole().toString()))));
                return AuthenticationResponse.builder()
                                .token(jwtToken)
                                .role(user.getRole())
                                .build();
        }
}