package com.ecm.common;

import lombok.Data;

@Data
public class PageRequest {

    private Integer page = 1;
    private Integer pageSize = 10;

    public Integer getOffset() {
        return (page - 1) * pageSize;
    }
}
