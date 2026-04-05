package com.ecm.outbound.repository;

import com.ecm.outbound.entity.BomItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BomItemRepository extends JpaRepository<BomItem, Long> {

    List<BomItem> findByBomIdOrderBySortOrder(Long bomId);

    void deleteByBomId(Long bomId);
}
