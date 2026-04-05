package com.ecm.alert.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "alert_record")
@EntityListeners(AuditingEntityListener.class)
public class AlertRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "rule_id")
    private Long ruleId;

    @Column(name = "alert_type", nullable = false, length = 30)
    private String alertType;

    @Column(name = "alert_level", length = 10)
    @Builder.Default
    private String alertLevel = "WARNING";

    @Column(name = "component_id")
    private Long componentId;

    @Column(name = "component_name", length = 200)
    private String componentName;

    @Column(name = "warehouse_id")
    private Long warehouseId;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @Column(name = "status", length = 20)
    @Builder.Default
    private String status = "PENDING";

    @Column(name = "handled_by")
    private Long handledBy;

    @Column(name = "handle_time")
    private LocalDateTime handleTime;

    @Column(name = "handle_remark", length = 500)
    private String handleRemark;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
