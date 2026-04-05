package com.ecm.report.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StaleReportDTO {
    private Long componentId;
    private String internalPartNo;
    private String componentName;
    private String categoryName;
    private BigDecimal currentQty;
    private String lastOutboundDate;
    private Integer staleDays;
    private BigDecimal staleValue;
}
