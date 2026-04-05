package com.ecm.inbound.dto;

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
public class InboundOrderDTO {

    private Long id;
    private String inboundNo;
    private Long poId;
    private String poNo;
    private Long supplierId;
    private String inboundType;
    private Long warehouseId;
    private Long operatorId;
    private String status;
    private String notes;
    private List<InboundOrderItemDTO> items;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class InboundOrderItemDTO {
        private Long id;
        private Long componentId;
        private String componentName;
        private String batchCode;
        private BigDecimal quantity;
        private Long locationId;
        private String barcode;
        private String qcStatus;
        private String notes;
    }
}
