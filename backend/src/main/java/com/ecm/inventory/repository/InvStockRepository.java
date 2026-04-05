package com.ecm.inventory.repository;

import com.ecm.inventory.entity.InvStock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InvStockRepository extends JpaRepository<InvStock, Long>, JpaSpecificationExecutor<InvStock> {

    List<InvStock> findByComponentIdAndDeleted(Long componentId, Integer deleted);

    @Query("SELECT s FROM InvStock s WHERE s.componentId = :componentId AND s.deleted = 0 AND s.quantity > 0 ORDER BY s.createdAt ASC")
    List<InvStock> findAvailableByComponentId(@Param("componentId") Long componentId);

    Optional<InvStock> findByIdAndDeleted(Long id, Integer deleted);

    @Query("SELECT s FROM InvStock s WHERE s.deleted = 0 AND s.quantity <= s.minStock AND s.minStock > 0")
    List<InvStock> findLowStockItems();

    @Query("SELECT s FROM InvStock s WHERE s.deleted = 0 AND s.quantity > 0 ORDER BY s.createdAt ASC")
    List<InvStock> findAllActive();
}
