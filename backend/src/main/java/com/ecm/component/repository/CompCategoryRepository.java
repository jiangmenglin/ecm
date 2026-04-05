package com.ecm.component.repository;

import com.ecm.component.entity.CompCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CompCategoryRepository extends JpaRepository<CompCategory, Long> {

    List<CompCategory> findByParentIdAndDeletedOrderBySortOrder(Long parentId, Integer deleted);

    List<CompCategory> findByDeletedOrderBySortOrder(Integer deleted);
}
