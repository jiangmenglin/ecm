package com.ecm.system.repository;

import com.ecm.system.entity.SysUserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SysUserRoleRepository extends JpaRepository<SysUserRole, Long> {

    List<SysUserRole> findByUserId(Long userId);

    Optional<SysUserRole> findByUserIdAndRoleId(Long userId, Long roleId);

    void deleteByUserId(Long userId);
}
