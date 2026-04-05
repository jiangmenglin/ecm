package com.ecm.inventory.service;

import com.ecm.common.BusinessException;
import com.ecm.common.PageResult;
import com.ecm.inventory.dto.BatchDTO;
import com.ecm.inventory.entity.InvBatch;
import com.ecm.inventory.repository.InvBatchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InvBatchService {

    private final InvBatchRepository invBatchRepository;

    public PageResult<InvBatch> list(int page, int size, String keyword) {
        List<InvBatch> all = invBatchRepository.findAll();
        // Filter out deleted
        List<InvBatch> active = all.stream()
                .filter(b -> b.getDeleted() == 0)
                .filter(b -> keyword == null || keyword.isEmpty()
                        || (b.getBatchCode() != null && b.getBatchCode().contains(keyword)))
                .toList();
        int total = active.size();
        int from = Math.min((page - 1) * size, total);
        int to = Math.min(from + size, total);
        return new PageResult<>(active.subList(from, to), (long) total, page, size);
    }

    public List<InvBatch> getByComponentId(Long componentId) {
        return invBatchRepository.findByComponentIdAndDeletedOrderByReceivedDateAsc(componentId, 0);
    }

    public InvBatch getById(Long id) {
        return invBatchRepository.findById(id)
                .filter(b -> b.getDeleted() == 0)
                .orElseThrow(() -> new BusinessException("Batch not found"));
    }

    @Transactional
    public InvBatch create(BatchDTO dto) {
        InvBatch batch = InvBatch.builder()
                .componentId(dto.getComponentId())
                .batchCode(dto.getBatchCode())
                .supplierBatch(dto.getSupplierBatch())
                .supplierId(dto.getSupplierId())
                .manufactureDate(dto.getManufactureDate())
                .expiryDate(dto.getExpiryDate())
                .receivedDate(dto.getReceivedDate() != null ? dto.getReceivedDate() : LocalDate.now())
                .originCountry(dto.getOriginCountry())
                .rohsCompliant(dto.getRohsCompliant())
                .msdLevel(dto.getMsdLevel())
                .floorLifeHours(dto.getFloorLifeHours())
                .remainingFloorLife(dto.getFloorLifeHours())
                .status(dto.getStatus() != null ? dto.getStatus() : "NORMAL")
                .notes(dto.getNotes())
                .build();
        return invBatchRepository.save(batch);
    }

    /**
     * Check MSD exposure: calculates how long the batch has been exposed since exposure_start_time.
     */
    @Transactional
    public void updateMsdExposure(Long batchId) {
        InvBatch batch = getById(batchId);
        if (batch.getExposureStartTime() != null && batch.getFloorLifeHours() != null) {
            long hoursExposed = ChronoUnit.HOURS.between(batch.getExposureStartTime(), LocalDateTime.now());
            batch.setExposureDurationHours(BigDecimal.valueOf(hoursExposed));

            BigDecimal remaining = batch.getFloorLifeHours().subtract(BigDecimal.valueOf(hoursExposed));
            batch.setRemainingFloorLife(remaining);

            if (remaining.compareTo(BigDecimal.ZERO) <= 0) {
                batch.setStatus("LOCKED");
            }
            invBatchRepository.save(batch);
        }
    }

    /**
     * Check for expired batches and update their status.
     */
    @Transactional
    public List<InvBatch> checkExpiry() {
        List<InvBatch> expired = invBatchRepository.findByExpiryDateBeforeAndStatusAndDeleted(
                LocalDate.now(), "NORMAL", 0);
        for (InvBatch batch : expired) {
            batch.setStatus("EXPIRED");
            invBatchRepository.save(batch);
        }
        return expired;
    }

    @Transactional
    public InvBatch recordBake(Long batchId) {
        InvBatch batch = getById(batchId);
        batch.setBakeCount(batch.getBakeCount() + 1);
        batch.setLastBakeTime(LocalDateTime.now());
        batch.setExposureDurationHours(BigDecimal.ZERO);
        batch.setExposureStartTime(null);
        if (batch.getFloorLifeHours() != null) {
            batch.setRemainingFloorLife(batch.getFloorLifeHours());
        }
        batch.setStatus("NORMAL");
        return invBatchRepository.save(batch);
    }
}
