package com.ecm.inventory.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockDTO {

    private Long id;
    private Long componentId;
    private String componentName;
    private String internalPn;
    private Long warehouseId;
    private String warehouseName;
    private Long locationId;
    private String locationCode;
    private Long batchId;
    private String batchCode;
    private BigDecimal quantity;
    private BigDecimal reservedQty;
    private BigDecimal inTransitQty;
    private BigDecimal inspectingQty;
    private String barcode;
    private Integer isOpened;
    private BigDecimal remainingInPackage;
    private BigDecimal safetyStock;
    private BigDecimal minStock;
    private BigDecimal maxStock;
    private String status;
}
