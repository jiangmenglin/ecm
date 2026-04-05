package com.ecm.inventory.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockQueryDTO {

    private String keyword;
    private Long warehouseId;
    private Long categoryId;
    private String status;
}
