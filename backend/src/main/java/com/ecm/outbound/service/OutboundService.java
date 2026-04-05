package com.ecm.outbound.service;

import com.ecm.common.BusinessException;
import com.ecm.inventory.entity.InvStock;
import com.ecm.inventory.service.InvStockService;
import com.ecm.outbound.dto.OutboundOrderDTO;
import com.ecm.outbound.entity.BomItem;
import com.ecm.outbound.entity.OutboundOrder;
import com.ecm.outbound.entity.OutboundOrderItem;
import com.ecm.outbound.repository.BomItemRepository;
import com.ecm.outbound.repository.OutboundOrderItemRepository;
import com.ecm.outbound.repository.OutboundOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OutboundService {

    private final OutboundOrderRepository outboundOrderRepository;
    private final OutboundOrderItemRepository outboundOrderItemRepository;
    private final BomItemRepository bomItemRepository;
    private final InvStockService invStockService;

    public List<OutboundOrder> listAll() {
        return outboundOrderRepository.findByDeletedOrderByIdDesc(0);
    }

    public OutboundOrder getById(Long id) {
        return outboundOrderRepository.findByIdAndDeleted(id, 0)
                .orElseThrow(() -> new BusinessException("Outbound order not found"));
    }

    public List<OutboundOrderItem> getItems(Long outboundId) {
        return outboundOrderItemRepository.findByOutboundId(outboundId);
    }

    @Transactional
    public OutboundOrder create(OutboundOrderDTO dto) {
        String outboundNo = generateOutboundNo();

        OutboundOrder order = OutboundOrder.builder()
                .outboundNo(outboundNo)
                .outboundType(dto.getOutboundType())
                .bomId(dto.getBomId())
                .productionOrderNo(dto.getProductionOrderNo())
                .targetLocation(dto.getTargetLocation())
                .warehouseId(dto.getWarehouseId())
                .applicantId(dto.getApplicantId())
                .status("PENDING")
                .notes(dto.getNotes())
                .build();

        OutboundOrder saved = outboundOrderRepository.save(order);

        if (dto.getItems() != null) {
            BigDecimal totalQty = BigDecimal.ZERO;
            for (OutboundOrderDTO.OutboundOrderItemDTO itemDTO : dto.getItems()) {
                OutboundOrderItem item = OutboundOrderItem.builder()
                        .outboundId(saved.getId())
                        .componentId(itemDTO.getComponentId())
                        .requiredQty(itemDTO.getRequiredQty())
                        .notes(itemDTO.getNotes())
                        .build();
                outboundOrderItemRepository.save(item);
                totalQty = totalQty.add(itemDTO.getRequiredQty());
            }
            saved.setTotalQty(totalQty);
            outboundOrderRepository.save(saved);
        }

        return saved;
    }

    /**
     * Generate a pick list from a BOM: auto-match BOM items and apply FIFO for stock allocation.
     */
    @Transactional
    public OutboundOrder createFromBom(Long bomId, Long warehouseId, String outboundType,
                                        String productionOrderNo, String targetLocation,
                                        Long applicantId, String notes) {
        List<BomItem> bomItems = bomItemRepository.findByBomIdOrderBySortOrder(bomId);
        if (bomItems.isEmpty()) {
            throw new BusinessException("BOM has no items");
        }

        String outboundNo = generateOutboundNo();
        OutboundOrder order = OutboundOrder.builder()
                .outboundNo(outboundNo)
                .outboundType(outboundType)
                .bomId(bomId)
                .productionOrderNo(productionOrderNo)
                .targetLocation(targetLocation)
                .warehouseId(warehouseId)
                .applicantId(applicantId)
                .status("APPROVED")
                .notes(notes)
                .build();
        OutboundOrder saved = outboundOrderRepository.save(order);

        BigDecimal totalQty = BigDecimal.ZERO;
        for (BomItem bomItem : bomItems) {
            // FIFO allocation
            List<InvStock> allocated = invStockService.fifoAllocate(bomItem.getComponentId(), bomItem.getQuantity());

            for (InvStock stock : allocated) {
                BigDecimal allocQty = bomItem.getQuantity().min(
                        stock.getQuantity().subtract(stock.getReservedQty()));
                OutboundOrderItem item = OutboundOrderItem.builder()
                        .outboundId(saved.getId())
                        .componentId(bomItem.getComponentId())
                        .batchId(stock.getBatchId())
                        .locationId(stock.getLocationId())
                        .requiredQty(allocQty)
                        .barcode(stock.getBarcode())
                        .build();
                outboundOrderItemRepository.save(item);
                totalQty = totalQty.add(allocQty);
            }
        }
        saved.setTotalQty(totalQty);
        return outboundOrderRepository.save(saved);
    }

    /**
     * Verify barcode during picking and confirm the picked item.
     */
    @Transactional
    public OutboundOrderItem verifyAndPick(Long itemId, String scannedBarcode, BigDecimal actualQty) {
        OutboundOrderItem item = outboundOrderItemRepository.findById(itemId)
                .orElseThrow(() -> new BusinessException("Outbound order item not found"));

        if (item.getBarcode() != null && !item.getBarcode().equals(scannedBarcode)) {
            throw new BusinessException("Barcode verification failed: scanned barcode does not match");
        }

        item.setBarcode(scannedBarcode);
        item.setActualQty(actualQty != null ? actualQty : item.getRequiredQty());
        item.setPicked(1);
        item.setVerified(1);
        return outboundOrderItemRepository.save(item);
    }

    @Transactional
    public OutboundOrder completeOutbound(Long id, Long operatorId) {
        OutboundOrder order = getById(id);
        order.setStatus("SHIPPED");

        List<OutboundOrderItem> items = outboundOrderItemRepository.findByOutboundId(order.getId());
        for (OutboundOrderItem item : items) {
            InvStock stock = invStockService.fifoAllocate(item.getComponentId(), item.getActualQty())
                    .stream().findFirst().orElse(null);
            if (stock != null) {
                BigDecimal beforeQty = stock.getQuantity();
                stock.setQuantity(stock.getQuantity().subtract(item.getActualQty()));
                invStockService.logOperation("OUTBOUND", item.getComponentId(), item.getBatchId(),
                        order.getWarehouseId(), item.getLocationId(), item.getActualQty(),
                        beforeQty, stock.getQuantity(), order.getOutboundNo(),
                        operatorId, null, "Outbound completed");
            }
        }

        return outboundOrderRepository.save(order);
    }

    @Transactional
    public OutboundOrder updateStatus(Long id, String status) {
        OutboundOrder order = getById(id);
        order.setStatus(status);
        return outboundOrderRepository.save(order);
    }

    @Transactional
    public void delete(Long id) {
        OutboundOrder order = getById(id);
        order.setDeleted(1);
        outboundOrderRepository.save(order);
    }

    private String generateOutboundNo() {
        String date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long count = outboundOrderRepository.count() + 1;
        return "OUT" + date + String.format("%04d", count);
    }
}
