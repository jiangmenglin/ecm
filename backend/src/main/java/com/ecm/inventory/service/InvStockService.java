package com.ecm.inventory.service;

import com.ecm.common.BusinessException;
import com.ecm.common.PageResult;
import com.ecm.component.entity.CompInfo;
import com.ecm.component.repository.CompInfoRepository;
import com.ecm.inventory.dto.StockDTO;
import com.ecm.inventory.dto.StockQueryDTO;
import com.ecm.inventory.entity.InvOperationLog;
import com.ecm.inventory.entity.InvStock;
import com.ecm.inventory.entity.Warehouse;
import com.ecm.inventory.entity.StorageLocation;
import com.ecm.inventory.entity.InvBatch;
import com.ecm.inventory.repository.*;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InvStockService {

    private final InvStockRepository invStockRepository;
    private final WarehouseRepository warehouseRepository;
    private final StorageLocationRepository storageLocationRepository;
    private final InvBatchRepository invBatchRepository;
    private final CompInfoRepository compInfoRepository;
    private final InvOperationLogRepository invOperationLogRepository;

    public PageResult<StockDTO> search(StockQueryDTO query, int page, int pageSize) {
        Specification<InvStock> spec = (root, q, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("deleted"), 0));
            if (query.getWarehouseId() != null) {
                predicates.add(cb.equal(root.get("warehouseId"), query.getWarehouseId()));
            }
            if (StringUtils.hasText(query.getStatus())) {
                predicates.add(cb.equal(root.get("status"), query.getStatus()));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<InvStock> pageResult = invStockRepository.findAll(spec,
                PageRequest.of(page - 1, pageSize, Sort.by(Sort.Direction.DESC, "createdAt")));

        List<StockDTO> dtoList = pageResult.getContent().stream()
                .map(this::toDTO)
                .toList();

        if (StringUtils.hasText(query.getKeyword()) || query.getCategoryId() != null) {
            dtoList = dtoList.stream().filter(dto -> {
                boolean match = true;
                if (StringUtils.hasText(query.getKeyword())) {
                    String kw = query.getKeyword().toLowerCase();
                    match = (dto.getComponentName() != null && dto.getComponentName().toLowerCase().contains(kw))
                            || (dto.getInternalPn() != null && dto.getInternalPn().toLowerCase().contains(kw));
                }
                return match;
            }).toList();
        }

        return new PageResult<>(dtoList, pageResult.getTotalElements(), page, pageSize);
    }

    public StockDTO getById(Long id) {
        return toDTO(invStockRepository.findByIdAndDeleted(id, 0)
                .orElseThrow(() -> new BusinessException("Stock not found")));
    }

    public List<StockDTO> getStockDashboard() {
        Map<Long, List<InvStock>> grouped = invStockRepository.findAllActive().stream()
                .collect(Collectors.groupingBy(InvStock::getComponentId));

        List<StockDTO> result = new ArrayList<>();
        for (Map.Entry<Long, List<InvStock>> entry : grouped.entrySet()) {
            List<InvStock> stocks = entry.getValue();
            BigDecimal totalQty = stocks.stream()
                    .map(InvStock::getQuantity)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            CompInfo comp = compInfoRepository.findById(entry.getKey()).orElse(null);
            if (comp == null) continue;

            BigDecimal minStock = stocks.get(0).getMinStock();
            BigDecimal safetyStock = stocks.get(0).getSafetyStock();

            StockDTO dto = StockDTO.builder()
                    .componentId(entry.getKey())
                    .componentName(comp.getComponentName())
                    .internalPn(comp.getInternalPn())
                    .quantity(totalQty)
                    .minStock(minStock)
                    .safetyStock(safetyStock)
                    .build();
            result.add(dto);
        }
        return result;
    }

    /**
     * FIFO allocation: returns stocks ordered by earliest received date for a given component.
     */
    public List<InvStock> fifoAllocate(Long componentId, BigDecimal requiredQty) {
        List<InvStock> available = invStockRepository.findAvailableByComponentId(componentId);
        List<InvStock> allocated = new ArrayList<>();
        BigDecimal remaining = requiredQty;

        for (InvStock stock : available) {
            if (remaining.compareTo(BigDecimal.ZERO) <= 0) break;
            BigDecimal availableQty = stock.getQuantity().subtract(stock.getReservedQty());
            if (availableQty.compareTo(BigDecimal.ZERO) > 0) {
                allocated.add(stock);
                remaining = remaining.subtract(availableQty);
            }
        }

        if (remaining.compareTo(BigDecimal.ZERO) > 0) {
            throw new BusinessException("Insufficient stock for component ID: " + componentId);
        }

        return allocated;
    }

    @Transactional
    public void logOperation(String operationType, Long componentId, Long batchId,
                             Long warehouseId, Long locationId, BigDecimal quantity,
                             BigDecimal beforeQty, BigDecimal afterQty,
                             String refOrderNo, Long operatorId, String operatorName, String remark) {
        InvOperationLog log = InvOperationLog.builder()
                .operationType(operationType)
                .componentId(componentId)
                .batchId(batchId)
                .warehouseId(warehouseId)
                .locationId(locationId)
                .quantity(quantity)
                .beforeQty(beforeQty)
                .afterQty(afterQty)
                .refOrderNo(refOrderNo)
                .operatorId(operatorId)
                .operatorName(operatorName)
                .remark(remark)
                .build();
        invOperationLogRepository.save(log);
    }

    public List<InvStock> getLowStockItems() {
        return invStockRepository.findLowStockItems();
    }

    private StockDTO toDTO(InvStock entity) {
        String componentName = null;
        String internalPn = null;
        if (entity.getComponentId() != null) {
            componentName = compInfoRepository.findById(entity.getComponentId())
                    .map(CompInfo::getComponentName).orElse(null);
            internalPn = compInfoRepository.findById(entity.getComponentId())
                    .map(CompInfo::getInternalPn).orElse(null);
        }
        String warehouseName = null;
        if (entity.getWarehouseId() != null) {
            warehouseName = warehouseRepository.findById(entity.getWarehouseId())
                    .map(Warehouse::getWarehouseName).orElse(null);
        }
        String locationCode = null;
        if (entity.getLocationId() != null) {
            locationCode = storageLocationRepository.findById(entity.getLocationId())
                    .map(StorageLocation::getLocationCode).orElse(null);
        }
        String batchCode = null;
        if (entity.getBatchId() != null) {
            batchCode = invBatchRepository.findById(entity.getBatchId())
                    .map(InvBatch::getBatchCode).orElse(null);
        }
        return StockDTO.builder()
                .id(entity.getId())
                .componentId(entity.getComponentId())
                .componentName(componentName)
                .internalPn(internalPn)
                .warehouseId(entity.getWarehouseId())
                .warehouseName(warehouseName)
                .locationId(entity.getLocationId())
                .locationCode(locationCode)
                .batchId(entity.getBatchId())
                .batchCode(batchCode)
                .quantity(entity.getQuantity())
                .reservedQty(entity.getReservedQty())
                .inTransitQty(entity.getInTransitQty())
                .inspectingQty(entity.getInspectingQty())
                .barcode(entity.getBarcode())
                .isOpened(entity.getIsOpened())
                .remainingInPackage(entity.getRemainingInPackage())
                .safetyStock(entity.getSafetyStock())
                .minStock(entity.getMinStock())
                .maxStock(entity.getMaxStock())
                .status(entity.getStatus())
                .build();
    }
}
