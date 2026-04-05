package com.ecm.outbound.entity;

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
@Table(name = "outbound_order")
@EntityListeners(AuditingEntityListener.class)
public class OutboundOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "outbound_no", nullable = false, unique = true, length = 50)
    private String outboundNo;

    @Column(name = "outbound_type", nullable = false, length = 20)
    private String outboundType;

    @Column(name = "bom_id")
    private Long bomId;

    @Column(name = "production_order_no", length = 80)
    private String productionOrderNo;

    @Column(name = "target_location", length = 200)
    private String targetLocation;

    @Column(name = "warehouse_id", nullable = false)
    private Long warehouseId;

    @Column(name = "total_qty", precision = 12, scale = 2)
    private BigDecimal totalQty;

    @Column(name = "applicant_id")
    private Long applicantId;

    @Column(name = "approver_id")
    private Long approverId;

    @Column(name = "approve_time")
    private LocalDateTime approveTime;

    @Column(name = "status", length = 20)
    @Builder.Default
    private String status = "PENDING";

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

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
