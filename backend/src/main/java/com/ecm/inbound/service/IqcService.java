package com.ecm.inbound.service;

import com.ecm.common.BusinessException;
import com.ecm.common.PageResult;
import com.ecm.inbound.dto.IqcRecordDTO;
import com.ecm.inbound.entity.InboundOrderItem;
import com.ecm.inbound.entity.IqcRecord;
import com.ecm.inbound.repository.InboundOrderItemRepository;
import com.ecm.inbound.repository.IqcRecordRepository;
import com.ecm.inventory.entity.InvLock;
import com.ecm.inventory.entity.InvStock;
import com.ecm.inventory.repository.InvStockRepository;
import com.ecm.inventory.service.InvLockService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class IqcService {

    private final IqcRecordRepository iqcRecordRepository;
    private final InboundOrderItemRepository inboundOrderItemRepository;
    private final InvStockRepository invStockRepository;
    private final InvLockService invLockService;

    public PageResult<IqcRecord> list(int page, int size, String status) {
        List<IqcRecord> all;
        if (status != null && !status.isEmpty()) {
            // Map frontend status to IQC result values
            String result = switch (status) {
                case "PENDING" -> null;
                case "PASSED" -> "PASS";
                case "FAILED" -> "FAIL";
                default -> status;
            };
            if (result != null) {
                all = iqcRecordRepository.findByResult(result);
            } else {
                all = iqcRecordRepository.findAll();
            }
        } else {
            all = iqcRecordRepository.findAll();
        }
        int total = all.size();
        int from = Math.min((page - 1) * size, total);
        int to = Math.min(from + size, total);
        return new PageResult<>(all.subList(from, to), (long) total, page, size);
    }

    public List<IqcRecord> getByInboundItem(Long inboundItemId) {
        return iqcRecordRepository.findByInboundItemId(inboundItemId);
    }

    public List<IqcRecord> getByComponent(Long componentId) {
        return iqcRecordRepository.findByComponentIdOrderByCreatedAtDesc(componentId);
    }

    @Transactional
    public IqcRecord inspect(IqcRecordDTO dto) {
        InboundOrderItem inboundItem = inboundOrderItemRepository.findById(dto.getInboundItemId())
                .orElseThrow(() -> new BusinessException("Inbound item not found"));

        IqcRecord record = IqcRecord.builder()
                .inboundItemId(dto.getInboundItemId())
                .componentId(dto.getComponentId())
                .batchId(dto.getBatchId())
                .inspectionType(dto.getInspectionType() != null ? dto.getInspectionType() : "SAMPLING")
                .sampleSize(dto.getSampleSize())
                .acceptQty(dto.getAcceptQty() != null ? dto.getAcceptQty() : 0)
                .rejectQty(dto.getRejectQty() != null ? dto.getRejectQty() : 0)
                .appearanceResult(dto.getAppearanceResult())
                .functionResult(dto.getFunctionResult())
                .pinOxidation(dto.getPinOxidation())
                .dimensionResult(dto.getDimensionResult())
                .result(dto.getResult())
                .inspectorId(dto.getInspectorId())
                .failureReason(dto.getFailureReason())
                .disposition(dto.getDisposition())
                .notes(dto.getNotes())
                .build();
        IqcRecord saved = iqcRecordRepository.save(record);

        // Update inbound item QC status
        if ("PASS".equals(dto.getResult())) {
            inboundItem.setQcStatus("PASSED");
        } else {
            inboundItem.setQcStatus("FAILED");
        }
        inboundOrderItemRepository.save(inboundItem);

        // Auto-lock stock on IQC fail
        if ("FAIL".equals(dto.getResult())) {
            autoLockOnFail(inboundItem, dto);
        }

        return saved;
    }

    private void autoLockOnFail(InboundOrderItem inboundItem, IqcRecordDTO dto) {
        List<InvStock> stocks = invStockRepository.findByComponentIdAndDeleted(
                inboundItem.getComponentId(), 0);
        for (InvStock stock : stocks) {
            if (stock.getBarcode() != null && stock.getBarcode().equals(inboundItem.getBarcode())) {
                Map<String, Object> lockBody = new HashMap<>();
                lockBody.put("stockId", stock.getId());
                lockBody.put("lockType", "MANUAL");
                lockBody.put("lockQty", stock.getQuantity());
                lockBody.put("reason", "IQC failed: " + (dto.getFailureReason() != null ? dto.getFailureReason() : "Quality issue"));
                lockBody.put("lockedBy", dto.getInspectorId());
                invLockService.lock(lockBody);
                break;
            }
        }
    }
}
