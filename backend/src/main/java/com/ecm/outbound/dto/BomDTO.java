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
public class BomDTO {

    private Long id;
    private String bomCode;
    private String productName;
    private String productCode;
    private String version;
    private String status;
    private String description;
    private List<BomItemDTO> items;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BomItemDTO {
        private Long id;
        private Long componentId;
        private String componentName;
        private BigDecimal quantity;
        private String unit;
        private String referenceDesignator;
        private Integer substituteAllowed;
        private String notes;
        private Integer sortOrder;
    }
}
