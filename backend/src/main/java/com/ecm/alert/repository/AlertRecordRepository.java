package com.ecm.alert.repository;

import com.ecm.alert.entity.AlertRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlertRecordRepository extends JpaRepository<AlertRecord, Long> {

    List<AlertRecord> findByStatusOrderByCreatedAtDesc(String status);

    List<AlertRecord> findByAlertTypeOrderByCreatedAtDesc(String alertType);

    List<AlertRecord> findByComponentIdOrderByCreatedAtDesc(Long componentId);

    List<AlertRecord> findAllByOrderByCreatedAtDesc();
}
