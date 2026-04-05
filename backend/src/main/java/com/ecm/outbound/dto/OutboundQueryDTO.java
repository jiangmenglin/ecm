package com.ecm.outbound.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OutboundQueryDTO {

    private String keyword;
    private String outboundType;
    private String status;
}
