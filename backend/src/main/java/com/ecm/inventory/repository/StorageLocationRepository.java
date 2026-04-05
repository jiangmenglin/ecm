package com.ecm.inventory.repository;

import com.ecm.inventory.entity.StorageLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StorageLocationRepository extends JpaRepository<StorageLocation, Long> {

    List<StorageLocation> findByWarehouseIdAndDeletedOrderByLocationCode(Long warehouseId, Integer deleted);

    List<StorageLocation> findByDeletedOrderByLocationCode(Integer deleted);
}
