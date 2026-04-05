package com.ecm.inventory.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BatchDTO {

    private Long id;
    private Long componentId;
    private String componentName;
    private String batchCode;
    private String supplierBatch;
    private Long supplierId;
    private LocalDate manufactureDate;
    private LocalDate expiryDate;
    private LocalDate receivedDate;
    private String originCountry;
    private Integer rohsCompliant;
    private Integer msdLevel;
    private BigDecimal floorLifeHours;
    private BigDecimal exposureDurationHours;
    private Integer bakeCount;
    private BigDecimal remainingFloorLife;
    private String status;
    private String notes;
}
