package com.ecm.outbound.service;

import com.ecm.common.BusinessException;
import com.ecm.outbound.dto.BomDTO;
import com.ecm.outbound.entity.Bom;
import com.ecm.outbound.entity.BomItem;
import com.ecm.outbound.repository.BomItemRepository;
import com.ecm.outbound.repository.BomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BomService {

    private final BomRepository bomRepository;
    private final BomItemRepository bomItemRepository;

    public List<Bom> listAll() {
        return bomRepository.findByDeletedOrderByIdDesc(0);
    }

    public Bom getById(Long id) {
        return bomRepository.findByIdAndDeleted(id, 0)
                .orElseThrow(() -> new BusinessException("BOM not found"));
    }

    public List<BomItem> getItems(Long bomId) {
        return bomItemRepository.findByBomIdOrderBySortOrder(bomId);
    }

    @Transactional
    public Bom create(BomDTO dto) {
        String bomCode = generateBomCode();
        Bom bom = Bom.builder()
                .bomCode(bomCode)
                .productName(dto.getProductName())
                .productCode(dto.getProductCode())
                .version(dto.getVersion() != null ? dto.getVersion() : "1.0")
                .status("ACTIVE")
                .description(dto.getDescription())
                .build();
        Bom saved = bomRepository.save(bom);

        if (dto.getItems() != null) {
            for (int i = 0; i < dto.getItems().size(); i++) {
                BomDTO.BomItemDTO itemDTO = dto.getItems().get(i);
                BomItem item = BomItem.builder()
                        .bomId(saved.getId())
                        .componentId(itemDTO.getComponentId())
                        .quantity(itemDTO.getQuantity())
                        .unit(itemDTO.getUnit() != null ? itemDTO.getUnit() : "个")
                        .referenceDesignator(itemDTO.getReferenceDesignator())
                        .substituteAllowed(itemDTO.getSubstituteAllowed() != null ? itemDTO.getSubstituteAllowed() : 0)
                        .notes(itemDTO.getNotes())
                        .sortOrder(itemDTO.getSortOrder() != null ? itemDTO.getSortOrder() : i)
                        .build();
                bomItemRepository.save(item);
            }
        }

        return saved;
    }

    @Transactional
    public Bom update(Long id, BomDTO dto) {
        Bom bom = getById(id);
        if (dto.getProductName() != null) bom.setProductName(dto.getProductName());
        if (dto.getProductCode() != null) bom.setProductCode(dto.getProductCode());
        if (dto.getVersion() != null) bom.setVersion(dto.getVersion());
        if (dto.getStatus() != null) bom.setStatus(dto.getStatus());
        if (dto.getDescription() != null) bom.setDescription(dto.getDescription());

        Bom saved = bomRepository.save(bom);

        if (dto.getItems() != null) {
            bomItemRepository.deleteByBomId(saved.getId());
            for (int i = 0; i < dto.getItems().size(); i++) {
                BomDTO.BomItemDTO itemDTO = dto.getItems().get(i);
                BomItem item = BomItem.builder()
                        .bomId(saved.getId())
                        .componentId(itemDTO.getComponentId())
                        .quantity(itemDTO.getQuantity())
                        .unit(itemDTO.getUnit() != null ? itemDTO.getUnit() : "个")
                        .referenceDesignator(itemDTO.getReferenceDesignator())
                        .substituteAllowed(itemDTO.getSubstituteAllowed() != null ? itemDTO.getSubstituteAllowed() : 0)
                        .notes(itemDTO.getNotes())
                        .sortOrder(itemDTO.getSortOrder() != null ? itemDTO.getSortOrder() : i)
                        .build();
                bomItemRepository.save(item);
            }
        }

        return saved;
    }

    @Transactional
    public void delete(Long id) {
        Bom bom = getById(id);
        bom.setDeleted(1);
        bomRepository.save(bom);
    }

    private String generateBomCode() {
        String date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long count = bomRepository.count() + 1;
        return "BOM" + date + String.format("%04d", count);
    }
}
