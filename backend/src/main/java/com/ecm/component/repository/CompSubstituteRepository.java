package com.ecm.component.repository;

import com.ecm.component.entity.CompSubstitute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CompSubstituteRepository extends JpaRepository<CompSubstitute, Long> {

    List<CompSubstitute> findByComponentIdOrderByPriority(Long componentId);

    void deleteByComponentId(Long componentId);
}
