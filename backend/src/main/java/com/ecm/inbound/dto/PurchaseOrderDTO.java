package com.ecm.inbound.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseOrderDTO {

    private Long id;
    private String poNo;
    private Long supplierId;
    private String supplierName;
    private LocalDate orderDate;
    private LocalDate expectedDate;
    private BigDecimal totalAmount;
    private String currency;
    private String status;
    private Long buyerId;
    private String notes;
    private List<PurchaseOrderItemDTO> items;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PurchaseOrderItemDTO {
        private Long id;
        private Long componentId;
        private String componentName;
        private BigDecimal quantity;
        private BigDecimal receivedQty;
        private BigDecimal unitPrice;
        private BigDecimal amount;
        private LocalDate requiredDate;
        private String notes;
    }
}
