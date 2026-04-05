package com.ecm.inbound.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupplierDTO {

    private Long id;
    private String supplierCode;
    private String supplierName;
    private String shortName;
    private String contactPerson;
    private String phone;
    private String email;
    private String address;
    private String website;
    private String qualification;
    private String paymentTerms;
    private Integer leadTimeDays;
    private Integer rating;
    private Integer status;
    private String notes;
}
