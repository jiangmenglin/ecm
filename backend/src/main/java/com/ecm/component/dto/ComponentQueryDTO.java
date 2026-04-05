package com.ecm.component.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ComponentQueryDTO {

    private String keyword;
    private Long categoryId;
    private String manufacturer;
    private String packageType;
    private String lifecycleStatus;
    private Integer status;
}
