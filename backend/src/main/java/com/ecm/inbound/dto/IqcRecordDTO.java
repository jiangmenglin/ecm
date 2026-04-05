package com.ecm.inbound.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IqcRecordDTO {

    private Long id;
    private Long inboundItemId;
    private Long componentId;
    private Long batchId;
    private String inspectionType;
    private Integer sampleSize;
    private Integer acceptQty;
    private Integer rejectQty;
    private String appearanceResult;
    private String functionResult;
    private String pinOxidation;
    private String dimensionResult;
    private String result;
    private Long inspectorId;
    private String failureReason;
    private String disposition;
    private String notes;
}
