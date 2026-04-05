package com.ecm.inventory.repository;

import com.ecm.inventory.entity.InvLock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InvLockRepository extends JpaRepository<InvLock, Long> {

    List<InvLock> findByStockIdAndStatus(Long stockId, String status);

    List<InvLock> findByStatus(String status);

    List<InvLock> findByLockRefId(String lockRefId);
}
