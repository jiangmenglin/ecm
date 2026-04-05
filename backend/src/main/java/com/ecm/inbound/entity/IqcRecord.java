package com.ecm.inbound.entity;

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
@Table(name = "iqc_record")
@EntityListeners(AuditingEntityListener.class)
public class IqcRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "inbound_item_id", nullable = false)
    private Long inboundItemId;

    @Column(name = "component_id", nullable = false)
    private Long componentId;

    @Column(name = "batch_id")
    private Long batchId;

    @Column(name = "inspection_type", length = 20)
    @Builder.Default
    private String inspectionType = "SAMPLING";

    @Column(name = "sample_size")
    private Integer sampleSize;

    @Column(name = "accept_qty")
    @Builder.Default
    private Integer acceptQty = 0;

    @Column(name = "reject_qty")
    @Builder.Default
    private Integer rejectQty = 0;

    @Column(name = "appearance_result", length = 10)
    private String appearanceResult;

    @Column(name = "function_result", length = 10)
    private String functionResult;

    @Column(name = "pin_oxidation", length = 10)
    private String pinOxidation;

    @Column(name = "dimension_result", length = 10)
    private String dimensionResult;

    @Column(name = "result", nullable = false, length = 10)
    private String result;

    @Column(name = "inspector_id")
    private Long inspectorId;

    @Column(name = "inspection_date")
    @Builder.Default
    private LocalDateTime inspectionDate = LocalDateTime.now();

    @Column(name = "failure_reason", columnDefinition = "TEXT")
    private String failureReason;

    @Column(name = "disposition", length = 20)
    private String disposition;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
