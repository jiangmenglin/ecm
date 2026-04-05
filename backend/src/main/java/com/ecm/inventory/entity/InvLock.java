package com.ecm.inventory.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "inv_lock")
@EntityListeners(AuditingEntityListener.class)
public class InvLock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "stock_id", nullable = false)
    private Long stockId;

    @Column(name = "lock_type", nullable = false, length = 20)
    private String lockType;

    @Column(name = "lock_ref_id", length = 80)
    private String lockRefId;

    @Column(name = "lock_qty", nullable = false, precision = 12, scale = 2)
    private BigDecimal lockQty;

    @Column(name = "reason", length = 500)
    private String reason;

    @Column(name = "locked_by")
    private Long lockedBy;

    @Column(name = "lock_time")
    @Builder.Default
    private LocalDateTime lockTime = LocalDateTime.now();

    @Column(name = "expected_release_time")
    private LocalDateTime expectedReleaseTime;

    @Column(name = "status", length = 20)
    @Builder.Default
    private String status = "LOCKED";

    @Column(name = "released_by")
    private Long releasedBy;

    @Column(name = "release_time")
    private LocalDateTime releaseTime;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
