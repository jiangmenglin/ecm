package com.ecm.inbound.repository;

import com.ecm.inbound.entity.IqcRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IqcRecordRepository extends JpaRepository<IqcRecord, Long> {

    List<IqcRecord> findByInboundItemId(Long inboundItemId);

    List<IqcRecord> findByComponentIdOrderByCreatedAtDesc(Long componentId);

    List<IqcRecord> findByResult(String result);
}
