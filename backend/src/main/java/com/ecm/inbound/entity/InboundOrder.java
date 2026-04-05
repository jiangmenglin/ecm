package com.ecm.inbound.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "inbound_order")
@EntityListeners(AuditingEntityListener.class)
public class InboundOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "inbound_no", nullable = false, unique = true, length = 50)
    private String inboundNo;

    @Column(name = "po_id")
    private Long poId;

    @Column(name = "po_no", length = 50)
    private String poNo;

    @Column(name = "supplier_id")
    private Long supplierId;

    @Column(name = "inbound_type", length = 20)
    @Builder.Default
    private String inboundType = "PURCHASE";

    @Column(name = "warehouse_id", nullable = false)
    private Long warehouseId;

    @Column(name = "operator_id")
    private Long operatorId;

    @Column(name = "inbound_date")
    private LocalDateTime inboundDate;

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
