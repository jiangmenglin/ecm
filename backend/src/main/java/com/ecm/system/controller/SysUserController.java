package com.ecm.system.controller;

import com.ecm.common.PageResult;
import com.ecm.common.Result;
import com.ecm.system.dto.UserDTO;
import com.ecm.system.entity.SysRole;
import com.ecm.system.entity.SysUser;
import com.ecm.system.entity.SysUserRole;
import com.ecm.system.repository.SysRoleRepository;
import com.ecm.system.repository.SysUserRoleRepository;
import com.ecm.system.service.SysUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/system/users")
@RequiredArgsConstructor
public class SysUserController {

    private final SysUserService sysUserService;
    private final SysUserRoleRepository sysUserRoleRepository;
    private final SysRoleRepository sysRoleRepository;

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @GetMapping
    public Result<PageResult<UserDTO>> list(
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<SysUser> userPage = sysUserService.listUsers(keyword, page, size);
        PageResult<UserDTO> pageResult = new PageResult<>(
                userPage.getContent().stream().map(this::toDTO).toList(),
                userPage.getTotalElements(),
                page,
                size
        );
        return Result.ok(pageResult);
    }

    @GetMapping("/{id}")
    public Result<UserDTO> getById(@PathVariable Long id) {
        return Result.ok(toDTO(sysUserService.getUserById(id)));
    }

    @PostMapping
    public Result<UserDTO> create(@RequestBody Map<String, Object> body) {
        UserDTO dto = new UserDTO();
        dto.setUsername((String) body.get("username"));
        dto.setRealName((String) body.get("realName"));
        dto.setEmail((String) body.get("email"));
        dto.setPhone((String) body.get("phone"));
        dto.setAvatar((String) body.get("avatar"));
        dto.setStatus(body.get("status") != null ? ((Number) body.get("status")).intValue() : 1);
        String role = (String) body.get("role");
        Boolean enabled = body.get("enabled") != null ? (Boolean) body.get("enabled") : true;
        String password = (String) body.getOrDefault("password", "123456");
        SysUser user = sysUserService.createUser(dto, password);
        // Save role
        if (role != null) {
            assignRole(user.getId(), role);
        }
        // Set enabled status
        if (!enabled) {
            user.setStatus(0);
            sysUserService.updateStatus(user.getId(), 0);
        }
        return Result.ok(toDTO(user));
    }

    @PutMapping("/{id}")
    public Result<UserDTO> update(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        UserDTO dto = new UserDTO();
        dto.setRealName((String) body.get("realName"));
        dto.setEmail((String) body.get("email"));
        dto.setPhone((String) body.get("phone"));
        dto.setAvatar((String) body.get("avatar"));
        SysUser user = sysUserService.updateUser(id, dto);

        // Update role
        String role = (String) body.get("role");
        if (role != null) {
            assignRole(id, role);
        }
        // Update enabled status
        if (body.get("enabled") != null) {
            boolean enabled = (Boolean) body.get("enabled");
            sysUserService.updateStatus(id, enabled ? 1 : 0);
        }
        return Result.ok(toDTO(sysUserService.getUserById(id)));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        sysUserService.deleteUser(id);
        return Result.ok();
    }

    @PutMapping("/{id}/reset-password")
    public Result<Void> resetPassword(@PathVariable Long id, @RequestBody Map<String, String> body) {
        sysUserService.resetPassword(id, body.get("password"));
        return Result.ok();
    }

    @PutMapping("/{id}/status")
    public Result<Void> toggleStatus(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        Boolean enabled = (Boolean) body.get("enabled");
        sysUserService.updateStatus(id, enabled != null && enabled ? 1 : 0);
        return Result.ok();
    }

    private void assignRole(Long userId, String roleCode) {
        SysRole role = sysRoleRepository.findAll().stream()
                .filter(r -> r.getRoleCode().equals(roleCode))
                .findFirst()
                .orElse(null);
        if (role != null) {
            sysUserRoleRepository.deleteByUserId(userId);
            sysUserRoleRepository.save(SysUserRole.builder()
                    .userId(userId)
                    .roleId(role.getId())
                    .build());
        }
    }

    private UserDTO toDTO(SysUser user) {
        // Lookup role
        String roleCode = "VIEWER";
        List<SysUserRole> userRoles = sysUserRoleRepository.findByUserId(user.getId());
        if (!userRoles.isEmpty()) {
            Map<Long, SysRole> roleMap = sysRoleRepository.findAll().stream()
                    .collect(Collectors.toMap(SysRole::getId, r -> r, (a, b) -> a));
            roleCode = userRoles.stream()
                    .map(ur -> roleMap.get(ur.getRoleId()))
                    .filter(r -> r != null)
                    .map(SysRole::getRoleCode)
                    .findFirst()
                    .orElse("VIEWER");
        }

        return UserDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .realName(user.getRealName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .avatar(user.getAvatar())
                .status(user.getStatus())
                .enabled(user.getStatus() != null && user.getStatus() == 1)
                .role(roleCode)
                .createTime(user.getCreatedAt() != null ? user.getCreatedAt().format(FMT) : null)
                .build();
    }
}
