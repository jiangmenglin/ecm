package com.ecm.component.repository;

import com.ecm.component.entity.CompParameter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CompParameterRepository extends JpaRepository<CompParameter, Long> {

    List<CompParameter> findByComponentIdOrderBySortOrder(Long componentId);

    void deleteByComponentId(Long componentId);
}
