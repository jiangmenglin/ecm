package com.ecm.outbound.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "outbound_order_item")
public class OutboundOrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "outbound_id", nullable = false)
    private Long outboundId;

    @Column(name = "component_id", nullable = false)
    private Long componentId;

    @Column(name = "batch_id")
    private Long batchId;

    @Column(name = "location_id")
    private Long locationId;

    @Column(name = "required_qty", nullable = false, precision = 12, scale = 2)
    private BigDecimal requiredQty;

    @Column(name = "actual_qty", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal actualQty = BigDecimal.ZERO;

    @Column(name = "barcode", length = 100)
    private String barcode;

    @Column(name = "picked")
    @Builder.Default
    private Integer picked = 0;

    @Column(name = "verified")
    @Builder.Default
    private Integer verified = 0;

    @Column(name = "notes", length = 500)
    private String notes;
}
