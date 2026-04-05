package com.ecm.inventory.repository;

import com.ecm.inventory.entity.InvOperationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface InvOperationLogRepository extends JpaRepository<InvOperationLog, Long> {

    List<InvOperationLog> findByComponentIdOrderByOperationTimeDesc(Long componentId);

    List<InvOperationLog> findByOperationTypeAndOperationTimeBetweenOrderByOperationTimeDesc(
            String operationType, LocalDateTime startTime, LocalDateTime endTime);

    @Query("SELECT l FROM InvOperationLog l WHERE l.operationTime BETWEEN :startTime AND :endTime ORDER BY l.operationTime DESC")
    List<InvOperationLog> findByTimeRange(@Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);
}
