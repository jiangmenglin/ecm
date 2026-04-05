package com.ecm.inbound.entity;

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
@Table(name = "inbound_order_item")
public class InboundOrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "inbound_id", nullable = false)
    private Long inboundId;

    @Column(name = "component_id", nullable = false)
    private Long componentId;

    @Column(name = "po_item_id")
    private Long poItemId;

    @Column(name = "batch_code", length = 80)
    private String batchCode;

    @Column(name = "quantity", nullable = false, precision = 12, scale = 2)
    private BigDecimal quantity;

    @Column(name = "location_id")
    private Long locationId;

    @Column(name = "barcode", length = 100)
    private String barcode;

    @Column(name = "qc_status", length = 20)
    @Builder.Default
    private String qcStatus = "PENDING";

    @Column(name = "notes", length = 500)
    private String notes;
}
