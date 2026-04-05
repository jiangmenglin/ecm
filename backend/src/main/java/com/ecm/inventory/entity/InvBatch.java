package com.ecm.inventory.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "inv_batch")
@EntityListeners(AuditingEntityListener.class)
public class InvBatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "component_id", nullable = false)
    private Long componentId;

    @Column(name = "batch_code", nullable = false, length = 80)
    private String batchCode;

    @Column(name = "supplier_batch", length = 80)
    private String supplierBatch;

    @Column(name = "supplier_id")
    private Long supplierId;

    @Column(name = "manufacture_date")
    private LocalDate manufactureDate;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Column(name = "received_date")
    private LocalDate receivedDate;

    @Column(name = "origin_country", length = 50)
    private String originCountry;

    @Column(name = "rohs_compliant")
    private Integer rohsCompliant;

    @Column(name = "msd_level")
    private Integer msdLevel;

    @Column(name = "floor_life_hours", precision = 8, scale = 2)
    private BigDecimal floorLifeHours;

    @Column(name = "exposure_start_time")
    private LocalDateTime exposureStartTime;

    @Column(name = "exposure_duration_hours", precision = 8, scale = 2)
    @Builder.Default
    private BigDecimal exposureDurationHours = BigDecimal.ZERO;

    @Column(name = "bake_count")
    @Builder.Default
    private Integer bakeCount = 0;

    @Column(name = "last_bake_time")
    private LocalDateTime lastBakeTime;

    @Column(name = "remaining_floor_life", precision = 8, scale = 2)
    private BigDecimal remainingFloorLife;

    @Column(name = "status", length = 20)
    @Builder.Default
    private String status = "NORMAL";

    @Column(name = "notes", length = 500)
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
