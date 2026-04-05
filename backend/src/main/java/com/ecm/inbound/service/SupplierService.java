package com.ecm.inbound.service;

import com.ecm.common.BusinessException;
import com.ecm.inbound.dto.SupplierDTO;
import com.ecm.inbound.entity.Supplier;
import com.ecm.inbound.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SupplierService {

    private final SupplierRepository supplierRepository;

    public List<Supplier> listAll() {
        return supplierRepository.findByDeletedOrderByIdDesc(0);
    }

    public Supplier getById(Long id) {
        return supplierRepository.findByIdAndDeleted(id, 0)
                .orElseThrow(() -> new BusinessException("Supplier not found"));
    }

    @Transactional
    public Supplier create(SupplierDTO dto) {
        Supplier entity = Supplier.builder()
                .supplierCode(dto.getSupplierCode())
                .supplierName(dto.getSupplierName())
                .shortName(dto.getShortName())
                .contactPerson(dto.getContactPerson())
                .phone(dto.getPhone())
                .email(dto.getEmail())
                .address(dto.getAddress())
                .website(dto.getWebsite())
                .qualification(dto.getQualification() != null ? dto.getQualification() : "QUALIFIED")
                .paymentTerms(dto.getPaymentTerms())
                .leadTimeDays(dto.getLeadTimeDays())
                .rating(dto.getRating())
                .status(dto.getStatus() != null ? dto.getStatus() : 1)
                .notes(dto.getNotes())
                .build();
        return supplierRepository.save(entity);
    }

    @Transactional
    public Supplier update(Long id, SupplierDTO dto) {
        Supplier entity = getById(id);
        if (dto.getSupplierName() != null) entity.setSupplierName(dto.getSupplierName());
        if (dto.getShortName() != null) entity.setShortName(dto.getShortName());
        if (dto.getContactPerson() != null) entity.setContactPerson(dto.getContactPerson());
        if (dto.getPhone() != null) entity.setPhone(dto.getPhone());
        if (dto.getEmail() != null) entity.setEmail(dto.getEmail());
        if (dto.getAddress() != null) entity.setAddress(dto.getAddress());
        if (dto.getWebsite() != null) entity.setWebsite(dto.getWebsite());
        if (dto.getQualification() != null) entity.setQualification(dto.getQualification());
        if (dto.getPaymentTerms() != null) entity.setPaymentTerms(dto.getPaymentTerms());
        if (dto.getLeadTimeDays() != null) entity.setLeadTimeDays(dto.getLeadTimeDays());
        if (dto.getRating() != null) entity.setRating(dto.getRating());
        if (dto.getStatus() != null) entity.setStatus(dto.getStatus());
        if (dto.getNotes() != null) entity.setNotes(dto.getNotes());
        return supplierRepository.save(entity);
    }

    @Transactional
    public void delete(Long id) {
        Supplier entity = getById(id);
        entity.setDeleted(1);
        supplierRepository.save(entity);
    }
}
