package com.ecm.inbound.service;

import com.ecm.common.BusinessException;
import com.ecm.inventory.dto.BatchDTO;
import com.ecm.inventory.entity.InvStock;
import com.ecm.inventory.repository.InvStockRepository;
import com.ecm.inventory.service.InvBatchService;
import com.ecm.inventory.service.InvStockService;
import com.ecm.inbound.dto.InboundOrderDTO;
import com.ecm.inbound.entity.InboundOrder;
import com.ecm.inbound.entity.InboundOrderItem;
import com.ecm.inbound.repository.InboundOrderItemRepository;
import com.ecm.inbound.repository.InboundOrderRepository;
import com.ecm.inventory.entity.StorageLocation;
import com.ecm.inventory.repository.StorageLocationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InboundService {

    private final InboundOrderRepository inboundOrderRepository;
    private final InboundOrderItemRepository inboundOrderItemRepository;
    private final InvStockRepository invStockRepository;
    private final StorageLocationRepository storageLocationRepository;
    private final InvBatchService invBatchService;
    private final InvStockService invStockService;

    public List<InboundOrder> listAll() {
        return inboundOrderRepository.findByDeletedOrderByIdDesc(0);
    }

    public InboundOrder getById(Long id) {
        return inboundOrderRepository.findByIdAndDeleted(id, 0)
                .orElseThrow(() -> new BusinessException("Inbound order not found"));
    }

    public List<InboundOrderItem> getItems(Long inboundId) {
        return inboundOrderItemRepository.findByInboundId(inboundId);
    }

    @Transactional
    public InboundOrder create(InboundOrderDTO dto) {
        String inboundNo = generateInboundNo();

        InboundOrder order = InboundOrder.builder()
                .inboundNo(inboundNo)
                .poId(dto.getPoId())
                .poNo(dto.getPoNo())
                .supplierId(dto.getSupplierId())
                .inboundType(dto.getInboundType() != null ? dto.getInboundType() : "PURCHASE")
                .warehouseId(dto.getWarehouseId())
                .operatorId(dto.getOperatorId())
                .status("PENDING")
                .notes(dto.getNotes())
                .build();

        InboundOrder saved = inboundOrderRepository.save(order);

        if (dto.getItems() != null) {
            for (InboundOrderDTO.InboundOrderItemDTO itemDTO : dto.getItems()) {
                String barcode = generateBarcode();
                InboundOrderItem item = InboundOrderItem.builder()
                        .inboundId(saved.getId())
                        .componentId(itemDTO.getComponentId())
                        .batchCode(itemDTO.getBatchCode())
                        .quantity(itemDTO.getQuantity())
                        .locationId(itemDTO.getLocationId() != null ? itemDTO.getLocationId() :
                                assignStorageLocation(saved.getWarehouseId()))
                        .barcode(barcode)
                        .qcStatus("PENDING")
                        .notes(itemDTO.getNotes())
                        .build();
                inboundOrderItemRepository.save(item);

                if (itemDTO.getBatchCode() != null) {
                    createBatch(saved, item);
                }
            }
        }

        return saved;
    }

    @Transactional
    public InboundOrder completeInbound(Long id, Long operatorId) {
        InboundOrder order = getById(id);
        order.setStatus("COMPLETED");
        order.setInboundDate(LocalDateTime.now());
        order.setOperatorId(operatorId);

        List<InboundOrderItem> items = inboundOrderItemRepository.findByInboundId(order.getId());
        for (InboundOrderItem item : items) {
            if (!"FAILED".equals(item.getQcStatus())) {
                addStock(order, item);
            }
        }

        return inboundOrderRepository.save(order);
    }

    @Transactional
    public InboundOrder updateStatus(Long id, String status) {
        InboundOrder order = getById(id);
        order.setStatus(status);
        return inboundOrderRepository.save(order);
    }

    @Transactional
    public void delete(Long id) {
        InboundOrder order = getById(id);
        order.setDeleted(1);
        inboundOrderRepository.save(order);
    }

    private void createBatch(InboundOrder order, InboundOrderItem item) {
        BatchDTO batchDTO = BatchDTO.builder()
                .componentId(item.getComponentId())
                .batchCode(item.getBatchCode())
                .supplierId(order.getSupplierId())
                .receivedDate(LocalDate.now())
                .status("NORMAL")
                .build();
        invBatchService.create(batchDTO);
    }

    private void addStock(InboundOrder order, InboundOrderItem item) {
        InvStock stock = InvStock.builder()
                .componentId(item.getComponentId())
                .warehouseId(order.getWarehouseId())
                .locationId(item.getLocationId())
                .quantity(item.getQuantity())
                .barcode(item.getBarcode())
                .status("NORMAL")
                .build();
        invStockRepository.save(stock);

        invStockService.logOperation("INBOUND", item.getComponentId(), null,
                order.getWarehouseId(), item.getLocationId(), item.getQuantity(),
                BigDecimal.ZERO, item.getQuantity(), order.getInboundNo(),
                order.getOperatorId(), null, "Inbound order completed");
    }

    private Long assignStorageLocation(Long warehouseId) {
        List<StorageLocation> locations = storageLocationRepository
                .findByWarehouseIdAndDeletedOrderByLocationCode(warehouseId, 0);
        if (locations.isEmpty()) {
            return null;
        }
        return locations.get(0).getId();
    }

    private String generateInboundNo() {
        String date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long count = inboundOrderRepository.count() + 1;
        return "IN" + date + String.format("%04d", count);
    }

    private String generateBarcode() {
        return "BC" + UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase();
    }
}
