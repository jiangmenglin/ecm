package com.ecm.inbound.repository;

import com.ecm.inbound.entity.PurchaseOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {

    List<PurchaseOrder> findByDeletedOrderByIdDesc(Integer deleted);

    Optional<PurchaseOrder> findByIdAndDeleted(Long id, Integer deleted);

    Optional<PurchaseOrder> findByPoNo(String poNo);
}
