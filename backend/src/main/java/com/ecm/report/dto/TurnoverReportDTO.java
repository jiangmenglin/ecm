package com.ecm.report.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TurnoverReportDTO {
    private Long componentId;
    private String internalPartNo;
    private String componentName;
    private String categoryName;
    private BigDecimal totalInbound;
    private BigDecimal totalOutbound;
    private BigDecimal averageStock;
    private BigDecimal turnoverRate;
    private Integer turnoverDays;
}
