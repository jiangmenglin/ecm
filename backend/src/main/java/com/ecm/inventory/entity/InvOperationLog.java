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
@Table(name = "inv_operation_log")
@EntityListeners(AuditingEntityListener.class)
public class InvOperationLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "operation_type", nullable = false, length = 30)
    private String operationType;

    @Column(name = "component_id", nullable = false)
    private Long componentId;

    @Column(name = "batch_id")
    private Long batchId;

    @Column(name = "warehouse_id")
    private Long warehouseId;

    @Column(name = "location_id")
    private Long locationId;

    @Column(name = "quantity", precision = 12, scale = 2)
    private BigDecimal quantity;

    @Column(name = "before_qty", precision = 12, scale = 2)
    private BigDecimal beforeQty;

    @Column(name = "after_qty", precision = 12, scale = 2)
    private BigDecimal afterQty;

    @Column(name = "ref_order_no", length = 80)
    private String refOrderNo;

    @Column(name = "operator_id")
    private Long operatorId;

    @Column(name = "operator_name", length = 50)
    private String operatorName;

    @Column(name = "operation_time")
    @Builder.Default
    private LocalDateTime operationTime = LocalDateTime.now();

    @Column(name = "remark", length = 500)
    private String remark;
}
