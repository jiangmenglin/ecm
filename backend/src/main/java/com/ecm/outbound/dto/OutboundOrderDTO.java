package com.ecm.outbound.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OutboundOrderDTO {

    private Long id;
    private String outboundNo;
    private String outboundType;
    private Long bomId;
    private String productionOrderNo;
    private String targetLocation;
    private Long warehouseId;
    private BigDecimal totalQty;
    private Long applicantId;
    private String status;
    private String notes;
    private List<OutboundOrderItemDTO> items;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OutboundOrderItemDTO {
        private Long id;
        private Long componentId;
        private String componentName;
        private Long batchId;
        private Long locationId;
        private BigDecimal requiredQty;
        private BigDecimal actualQty;
        private String barcode;
        private Integer picked;
        private Integer verified;
        private String notes;
    }
}
