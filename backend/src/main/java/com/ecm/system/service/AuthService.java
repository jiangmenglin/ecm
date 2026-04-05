package com.ecm.system.service;

import com.ecm.common.BusinessException;
import com.ecm.security.JwtTokenProvider;
import com.ecm.system.dto.LoginRequest;
import com.ecm.system.dto.LoginResponse;
import com.ecm.system.entity.SysUser;
import com.ecm.system.repository.SysUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final SysUserRepository sysUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public LoginResponse login(LoginRequest request) {
        SysUser user = sysUserRepository.findByUsernameAndDeleted(request.getUsername(), 0)
                .orElseThrow(() -> new BusinessException(401, "Invalid username or password"));

        if (user.getStatus() == 0) {
            throw new BusinessException(401, "Account is disabled");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BusinessException(401, "Invalid username or password");
        }

        user.setLastLoginTime(LocalDateTime.now());
        sysUserRepository.save(user);

        String token = jwtTokenProvider.generateToken(user.getId(), user.getUsername());

        return LoginResponse.builder()
                .token(token)
                .userId(user.getId())
                .username(user.getUsername())
                .realName(user.getRealName())
                .build();
    }
}
