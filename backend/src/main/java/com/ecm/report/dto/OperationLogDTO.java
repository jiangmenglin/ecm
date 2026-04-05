package com.ecm.report.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OperationLogDTO {
    private Long id;
    private String module;
    private String operation;
    private String operator;
    private String target;
    private String detail;
    private String ip;
    private String createTime;
}
