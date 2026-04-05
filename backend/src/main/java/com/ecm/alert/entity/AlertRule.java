package com.ecm.alert.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "alert_rule")
@EntityListeners(AuditingEntityListener.class)
public class AlertRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "rule_name", nullable = false, length = 100)
    private String ruleName;

    @Column(name = "rule_type", nullable = false, length = 30)
    private String ruleType;

    @Column(name = "target_type", length = 20)
    @Builder.Default
    private String targetType = "ALL";

    @Column(name = "target_id")
    private Long targetId;

    @Column(name = "threshold_value", precision = 12, scale = 2)
    private BigDecimal thresholdValue;

    @Column(name = "threshold_unit", length = 20)
    private String thresholdUnit;

    @Column(name = "advance_days")
    private Integer advanceDays;

    @Column(name = "notify_method", length = 30)
    @Builder.Default
    private String notifyMethod = "SYSTEM";

    @Column(name = "notify_users", length = 500)
    private String notifyUsers;

    @Column(name = "enabled")
    @Builder.Default
    private Integer enabled = 1;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "deleted")
    @Builder.Default
    private Integer deleted = 0;
}
