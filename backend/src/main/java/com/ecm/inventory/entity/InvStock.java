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
@Table(name = "inv_stock")
@EntityListeners(AuditingEntityListener.class)
public class InvStock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "component_id", nullable = false)
    private Long componentId;

    @Column(name = "warehouse_id", nullable = false)
    private Long warehouseId;

    @Column(name = "location_id")
    private Long locationId;

    @Column(name = "batch_id")
    private Long batchId;

    @Column(name = "quantity", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal quantity = BigDecimal.ZERO;

    @Column(name = "reserved_qty", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal reservedQty = BigDecimal.ZERO;

    @Column(name = "in_transit_qty", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal inTransitQty = BigDecimal.ZERO;

    @Column(name = "inspecting_qty", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal inspectingQty = BigDecimal.ZERO;

    @Column(name = "barcode", length = 100)
    private String barcode;

    @Column(name = "is_opened")
    @Builder.Default
    private Integer isOpened = 0;

    @Column(name = "remaining_in_package", precision = 12, scale = 2)
    private BigDecimal remainingInPackage;

    @Column(name = "safety_stock", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal safetyStock = BigDecimal.ZERO;

    @Column(name = "min_stock", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal minStock = BigDecimal.ZERO;

    @Column(name = "max_stock", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal maxStock = BigDecimal.ZERO;

    @Column(name = "last_count_date")
    private LocalDate lastCountDate;

    @Column(name = "status", length = 20)
    @Builder.Default
    private String status = "NORMAL";

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
