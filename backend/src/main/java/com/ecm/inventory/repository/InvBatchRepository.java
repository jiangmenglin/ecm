package com.ecm.inventory.repository;

import com.ecm.inventory.entity.InvBatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface InvBatchRepository extends JpaRepository<InvBatch, Long> {

    Optional<InvBatch> findByComponentIdAndBatchCodeAndDeleted(Long componentId, String batchCode, Integer deleted);

    List<InvBatch> findByComponentIdAndDeletedOrderByReceivedDateAsc(Long componentId, Integer deleted);

    List<InvBatch> findByExpiryDateBeforeAndStatusAndDeleted(LocalDate date, String status, Integer deleted);

    List<InvBatch> findByStatusAndDeleted(String status, Integer deleted);
}
