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
public class WarehouseDTO {

    private Long id;
    private String warehouseCode;
    private String warehouseName;
    private String warehouseType;
    private String address;
    private Long managerId;
    private BigDecimal temperatureMin;
    private BigDecimal temperatureMax;
    private BigDecimal humidityMin;
    private BigDecimal humidityMax;
    private Integer esdProtected;
    private Integer status;
    private String description;
}
