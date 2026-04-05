package com.ecm.component.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComponentDTO {

    private Long id;
    private Long categoryId;
    private String categoryName;
    private String internalPn;
    private String manufacturerPn;
    private String manufacturer;
    private String componentName;
    private String packageType;
    private String packageUnit;
    private Integer minPackageQty;
    private String lifecycleStatus;
    private Integer msdLevel;
    private Integer esdSensitive;
    private String esdClass;
    private Integer shelfLifeDays;
    private String temperatureRange;
    private String humidityRange;
    private String description;
    private String datasheetUrl;
    private String imageUrl;
    private Integer status;
    private List<ParameterDTO> parameters;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ParameterDTO {
        private Long id;
        private String paramName;
        private String paramValue;
        private String paramUnit;
        private Integer sortOrder;
    }
}
