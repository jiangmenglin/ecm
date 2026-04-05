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
@Table(name = "bom_item")
public class BomItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "bom_id", nullable = false)
    private Long bomId;

    @Column(name = "component_id", nullable = false)
    private Long componentId;

    @Column(name = "quantity", nullable = false, precision = 12, scale = 4)
    private BigDecimal quantity;

    @Column(name = "unit", length = 20)
    @Builder.Default
    private String unit = "个";

    @Column(name = "reference_designator", length = 200)
    private String referenceDesignator;

    @Column(name = "substitute_allowed")
    @Builder.Default
    private Integer substituteAllowed = 0;

    @Column(name = "notes", length = 500)
    private String notes;

    @Column(name = "sort_order")
    @Builder.Default
    private Integer sortOrder = 0;
}
