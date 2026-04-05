package com.ecm.inventory.repository;

import com.ecm.inventory.entity.Warehouse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WarehouseRepository extends JpaRepository<Warehouse, Long> {

    List<Warehouse> findByDeletedOrderByCreatedAtDesc(Integer deleted);

    Optional<Warehouse> findByIdAndDeleted(Long id, Integer deleted);
}
