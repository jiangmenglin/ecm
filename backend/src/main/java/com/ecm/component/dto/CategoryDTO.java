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
public class CategoryDTO {

    private Long id;
    private Long parentId;
    private String categoryCode;
    private String categoryName;
    private String icon;
    private Integer sortOrder;
    private Integer status;
    private String description;
    private List<CategoryDTO> children;
}
