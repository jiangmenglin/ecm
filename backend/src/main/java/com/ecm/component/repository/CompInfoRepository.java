package com.ecm.component.repository;

import com.ecm.component.entity.CompInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CompInfoRepository extends JpaRepository<CompInfo, Long>, JpaSpecificationExecutor<CompInfo> {

    Optional<CompInfo> findByInternalPn(String internalPn);

    Optional<CompInfo> findByManufacturerPn(String manufacturerPn);

    List<CompInfo> findByCategoryId(Long categoryId);

    Optional<CompInfo> findByIdAndDeleted(Long id, Integer deleted);
}
