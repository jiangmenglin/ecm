package com.ecm.component.service;

import com.ecm.common.BusinessException;
import com.ecm.component.dto.CategoryDTO;
import com.ecm.component.entity.CompCategory;
import com.ecm.component.repository.CompCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CompCategoryService {

    private final CompCategoryRepository compCategoryRepository;

    public List<CategoryDTO> getCategoryTree() {
        List<CompCategory> all = compCategoryRepository.findByDeletedOrderBySortOrder(0);
        List<CategoryDTO> dtoList = all.stream().map(this::toDTO).toList();
        return buildTree(dtoList);
    }

    public CategoryDTO getById(Long id) {
        return toDTO(compCategoryRepository.findById(id)
                .filter(c -> c.getDeleted() == 0)
                .orElseThrow(() -> new BusinessException("Category not found")));
    }

    @Transactional
    public CategoryDTO create(CategoryDTO dto) {
        CompCategory entity = CompCategory.builder()
                .parentId(dto.getParentId() != null ? dto.getParentId() : 0L)
                .categoryCode(dto.getCategoryCode())
                .categoryName(dto.getCategoryName())
                .icon(dto.getIcon())
                .sortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : 0)
                .status(dto.getStatus() != null ? dto.getStatus() : 1)
                .description(dto.getDescription())
                .build();
        return toDTO(compCategoryRepository.save(entity));
    }

    @Transactional
    public CategoryDTO update(Long id, CategoryDTO dto) {
        CompCategory entity = compCategoryRepository.findById(id)
                .filter(c -> c.getDeleted() == 0)
                .orElseThrow(() -> new BusinessException("Category not found"));
        if (dto.getParentId() != null) entity.setParentId(dto.getParentId());
        if (dto.getCategoryCode() != null) entity.setCategoryCode(dto.getCategoryCode());
        if (dto.getCategoryName() != null) entity.setCategoryName(dto.getCategoryName());
        if (dto.getIcon() != null) entity.setIcon(dto.getIcon());
        if (dto.getSortOrder() != null) entity.setSortOrder(dto.getSortOrder());
        if (dto.getStatus() != null) entity.setStatus(dto.getStatus());
        if (dto.getDescription() != null) entity.setDescription(dto.getDescription());
        return toDTO(compCategoryRepository.save(entity));
    }

    @Transactional
    public void delete(Long id) {
        CompCategory entity = compCategoryRepository.findById(id)
                .filter(c -> c.getDeleted() == 0)
                .orElseThrow(() -> new BusinessException("Category not found"));
        entity.setDeleted(1);
        compCategoryRepository.save(entity);
    }

    private CategoryDTO toDTO(CompCategory entity) {
        return CategoryDTO.builder()
                .id(entity.getId())
                .parentId(entity.getParentId())
                .categoryCode(entity.getCategoryCode())
                .categoryName(entity.getCategoryName())
                .icon(entity.getIcon())
                .sortOrder(entity.getSortOrder())
                .status(entity.getStatus())
                .description(entity.getDescription())
                .build();
    }

    private List<CategoryDTO> buildTree(List<CategoryDTO> all) {
        Map<Long, List<CategoryDTO>> childrenMap = all.stream()
                .filter(dto -> dto.getParentId() != null && dto.getParentId() != 0)
                .collect(Collectors.groupingBy(CategoryDTO::getParentId));

        List<CategoryDTO> roots = all.stream()
                .filter(dto -> dto.getParentId() == null || dto.getParentId() == 0)
                .collect(Collectors.toList());

        for (CategoryDTO root : roots) {
            root.setChildren(getChildren(root.getId(), childrenMap));
        }
        return roots;
    }

    private List<CategoryDTO> getChildren(Long parentId, Map<Long, List<CategoryDTO>> childrenMap) {
        List<CategoryDTO> children = childrenMap.getOrDefault(parentId, new ArrayList<>());
        for (CategoryDTO child : children) {
            child.setChildren(getChildren(child.getId(), childrenMap));
        }
        return children;
    }
}
