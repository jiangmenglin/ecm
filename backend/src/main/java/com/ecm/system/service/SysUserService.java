package com.ecm.system.service;

import com.ecm.common.BusinessException;
import com.ecm.system.dto.UserDTO;
import com.ecm.system.entity.SysUser;
import com.ecm.system.repository.SysUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class SysUserService {

    private final SysUserRepository sysUserRepository;
    private final PasswordEncoder passwordEncoder;

    public Page<SysUser> listUsers(String keyword, int page, int pageSize) {
        Specification<SysUser> spec = (root, query, cb) -> {
            var predicates = new java.util.ArrayList<jakarta.persistence.criteria.Predicate>();
            predicates.add(cb.equal(root.get("deleted"), 0));
            if (StringUtils.hasText(keyword)) {
                predicates.add(cb.or(
                    cb.like(root.get("username"), "%" + keyword + "%"),
                    cb.like(root.get("realName"), "%" + keyword + "%")
                ));
            }
            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
        return sysUserRepository.findAll(spec, PageRequest.of(page - 1, pageSize, Sort.by(Sort.Direction.DESC, "createdAt")));
    }

    public SysUser getUserById(Long id) {
        return sysUserRepository.findById(id)
                .filter(u -> u.getDeleted() == 0)
                .orElseThrow(() -> new BusinessException("User not found"));
    }

    public SysUser createUser(UserDTO dto, String rawPassword) {
        if (sysUserRepository.findByUsername(dto.getUsername()).isPresent()) {
            throw new BusinessException("Username already exists");
        }
        SysUser user = SysUser.builder()
                .username(dto.getUsername())
                .password(passwordEncoder.encode(rawPassword))
                .realName(dto.getRealName())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .avatar(dto.getAvatar())
                .status(dto.getStatus() != null ? dto.getStatus() : 1)
                .build();
        return sysUserRepository.save(user);
    }

    public SysUser updateUser(Long id, UserDTO dto) {
        SysUser user = getUserById(id);
        if (dto.getRealName() != null) user.setRealName(dto.getRealName());
        if (dto.getEmail() != null) user.setEmail(dto.getEmail());
        if (dto.getPhone() != null) user.setPhone(dto.getPhone());
        if (dto.getAvatar() != null) user.setAvatar(dto.getAvatar());
        if (dto.getStatus() != null) user.setStatus(dto.getStatus());
        return sysUserRepository.save(user);
    }

    public void deleteUser(Long id) {
        SysUser user = getUserById(id);
        user.setDeleted(1);
        sysUserRepository.save(user);
    }

    public void resetPassword(Long id, String newPassword) {
        SysUser user = getUserById(id);
        user.setPassword(passwordEncoder.encode(newPassword));
        sysUserRepository.save(user);
    }

    public void updateStatus(Long id, int status) {
        SysUser user = getUserById(id);
        user.setStatus(status);
        sysUserRepository.save(user);
    }
}
