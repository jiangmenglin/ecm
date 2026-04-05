package com.ecm.component.service;

import com.ecm.common.BusinessException;
import com.ecm.common.PageResult;
import com.ecm.component.dto.ComponentDTO;
import com.ecm.component.dto.ComponentQueryDTO;
import com.ecm.component.entity.CompCategory;
import com.ecm.component.entity.CompInfo;
import com.ecm.component.entity.CompParameter;
import com.ecm.component.repository.CompCategoryRepository;
import com.ecm.component.repository.CompInfoRepository;
import com.ecm.component.repository.CompParameterRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CompInfoService {

    private final CompInfoRepository compInfoRepository;
    private final CompParameterRepository compParameterRepository;
    private final CompCategoryRepository compCategoryRepository;

    public PageResult<ComponentDTO> search(ComponentQueryDTO query, int page, int pageSize) {
        Specification<CompInfo> spec = (root, q, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("deleted"), 0));
            if (StringUtils.hasText(query.getKeyword())) {
                predicates.add(cb.or(
                    cb.like(root.get("internalPn"), "%" + query.getKeyword() + "%"),
                    cb.like(root.get("manufacturerPn"), "%" + query.getKeyword() + "%"),
                    cb.like(root.get("componentName"), "%" + query.getKeyword() + "%"),
                    cb.like(root.get("manufacturer"), "%" + query.getKeyword() + "%")
                ));
            }
            if (query.getCategoryId() != null) {
                predicates.add(cb.equal(root.get("categoryId"), query.getCategoryId()));
            }
            if (StringUtils.hasText(query.getManufacturer())) {
                predicates.add(cb.like(root.get("manufacturer"), "%" + query.getManufacturer() + "%"));
            }
            if (StringUtils.hasText(query.getPackageType())) {
                predicates.add(cb.equal(root.get("packageType"), query.getPackageType()));
            }
            if (StringUtils.hasText(query.getLifecycleStatus())) {
                predicates.add(cb.equal(root.get("lifecycleStatus"), query.getLifecycleStatus()));
            }
            if (query.getStatus() != null) {
                predicates.add(cb.equal(root.get("status"), query.getStatus()));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<CompInfo> pageResult = compInfoRepository.findAll(spec,
                PageRequest.of(page - 1, pageSize, Sort.by(Sort.Direction.DESC, "createdAt")));

        List<ComponentDTO> dtoList = pageResult.getContent().stream()
                .map(this::toDTO)
                .toList();

        return new PageResult<>(dtoList, pageResult.getTotalElements(), page, pageSize);
    }

    public ComponentDTO getById(Long id) {
        CompInfo info = compInfoRepository.findByIdAndDeleted(id, 0)
                .orElseThrow(() -> new BusinessException("Component not found"));
        return toDTOWithParams(info);
    }

    public ComponentDTO getByInternalPn(String internalPn) {
        CompInfo info = compInfoRepository.findByInternalPn(internalPn)
                .orElseThrow(() -> new BusinessException("Component not found with PN: " + internalPn));
        return toDTOWithParams(info);
    }

    @Transactional
    public ComponentDTO create(ComponentDTO dto) {
        if (compInfoRepository.findByInternalPn(dto.getInternalPn()).isPresent()) {
            throw new BusinessException("Internal PN already exists");
        }
        CompInfo entity = CompInfo.builder()
                .categoryId(dto.getCategoryId())
                .internalPn(dto.getInternalPn())
                .manufacturerPn(dto.getManufacturerPn())
                .manufacturer(dto.getManufacturer())
                .componentName(dto.getComponentName())
                .packageType(dto.getPackageType())
                .packageUnit(dto.getPackageUnit() != null ? dto.getPackageUnit() : "个")
                .minPackageQty(dto.getMinPackageQty() != null ? dto.getMinPackageQty() : 1)
                .lifecycleStatus(dto.getLifecycleStatus() != null ? dto.getLifecycleStatus() : "ACTIVE")
                .msdLevel(dto.getMsdLevel())
                .esdSensitive(dto.getEsdSensitive() != null ? dto.getEsdSensitive() : 0)
                .esdClass(dto.getEsdClass())
                .shelfLifeDays(dto.getShelfLifeDays())
                .temperatureRange(dto.getTemperatureRange())
                .humidityRange(dto.getHumidityRange())
                .description(dto.getDescription())
                .datasheetUrl(dto.getDatasheetUrl())
                .imageUrl(dto.getImageUrl())
                .status(dto.getStatus() != null ? dto.getStatus() : 1)
                .build();
        CompInfo saved = compInfoRepository.save(entity);
        saveParameters(saved.getId(), dto.getParameters());
        return toDTOWithParams(saved);
    }

    @Transactional
    public ComponentDTO update(Long id, ComponentDTO dto) {
        CompInfo entity = compInfoRepository.findByIdAndDeleted(id, 0)
                .orElseThrow(() -> new BusinessException("Component not found"));
        if (dto.getCategoryId() != null) entity.setCategoryId(dto.getCategoryId());
        if (dto.getManufacturerPn() != null) entity.setManufacturerPn(dto.getManufacturerPn());
        if (dto.getManufacturer() != null) entity.setManufacturer(dto.getManufacturer());
        if (dto.getComponentName() != null) entity.setComponentName(dto.getComponentName());
        if (dto.getPackageType() != null) entity.setPackageType(dto.getPackageType());
        if (dto.getPackageUnit() != null) entity.setPackageUnit(dto.getPackageUnit());
        if (dto.getMinPackageQty() != null) entity.setMinPackageQty(dto.getMinPackageQty());
        if (dto.getLifecycleStatus() != null) entity.setLifecycleStatus(dto.getLifecycleStatus());
        if (dto.getMsdLevel() != null) entity.setMsdLevel(dto.getMsdLevel());
        if (dto.getEsdSensitive() != null) entity.setEsdSensitive(dto.getEsdSensitive());
        if (dto.getEsdClass() != null) entity.setEsdClass(dto.getEsdClass());
        if (dto.getShelfLifeDays() != null) entity.setShelfLifeDays(dto.getShelfLifeDays());
        if (dto.getTemperatureRange() != null) entity.setTemperatureRange(dto.getTemperatureRange());
        if (dto.getHumidityRange() != null) entity.setHumidityRange(dto.getHumidityRange());
        if (dto.getDescription() != null) entity.setDescription(dto.getDescription());
        if (dto.getDatasheetUrl() != null) entity.setDatasheetUrl(dto.getDatasheetUrl());
        if (dto.getImageUrl() != null) entity.setImageUrl(dto.getImageUrl());
        if (dto.getStatus() != null) entity.setStatus(dto.getStatus());
        CompInfo saved = compInfoRepository.save(entity);

        if (dto.getParameters() != null) {
            compParameterRepository.deleteByComponentId(saved.getId());
            saveParameters(saved.getId(), dto.getParameters());
        }
        return toDTOWithParams(saved);
    }

    @Transactional
    public void delete(Long id) {
        CompInfo entity = compInfoRepository.findByIdAndDeleted(id, 0)
                .orElseThrow(() -> new BusinessException("Component not found"));
        entity.setDeleted(1);
        compInfoRepository.save(entity);
    }

    private void saveParameters(Long componentId, List<ComponentDTO.ParameterDTO> parameters) {
        if (parameters == null) return;
        for (int i = 0; i < parameters.size(); i++) {
            ComponentDTO.ParameterDTO p = parameters.get(i);
            CompParameter param = CompParameter.builder()
                    .componentId(componentId)
                    .paramName(p.getParamName())
                    .paramValue(p.getParamValue())
                    .paramUnit(p.getParamUnit())
                    .sortOrder(p.getSortOrder() != null ? p.getSortOrder() : i)
                    .build();
            compParameterRepository.save(param);
        }
    }

    private ComponentDTO toDTO(CompInfo entity) {
        String categoryName = null;
        if (entity.getCategoryId() != null) {
            categoryName = compCategoryRepository.findById(entity.getCategoryId())
                    .map(CompCategory::getCategoryName).orElse(null);
        }
        return ComponentDTO.builder()
                .id(entity.getId())
                .categoryId(entity.getCategoryId())
                .categoryName(categoryName)
                .internalPn(entity.getInternalPn())
                .manufacturerPn(entity.getManufacturerPn())
                .manufacturer(entity.getManufacturer())
                .componentName(entity.getComponentName())
                .packageType(entity.getPackageType())
                .packageUnit(entity.getPackageUnit())
                .minPackageQty(entity.getMinPackageQty())
                .lifecycleStatus(entity.getLifecycleStatus())
                .msdLevel(entity.getMsdLevel())
                .esdSensitive(entity.getEsdSensitive())
                .esdClass(entity.getEsdClass())
                .shelfLifeDays(entity.getShelfLifeDays())
                .temperatureRange(entity.getTemperatureRange())
                .humidityRange(entity.getHumidityRange())
                .description(entity.getDescription())
                .datasheetUrl(entity.getDatasheetUrl())
                .imageUrl(entity.getImageUrl())
                .status(entity.getStatus())
                .build();
    }

    private ComponentDTO toDTOWithParams(CompInfo entity) {
        ComponentDTO dto = toDTO(entity);
        List<CompParameter> params = compParameterRepository.findByComponentIdOrderBySortOrder(entity.getId());
        dto.setParameters(params.stream().map(p -> ComponentDTO.ParameterDTO.builder()
                .id(p.getId())
                .paramName(p.getParamName())
                .paramValue(p.getParamValue())
                .paramUnit(p.getParamUnit())
                .sortOrder(p.getSortOrder())
                .build()).toList());
        return dto;
    }
}
