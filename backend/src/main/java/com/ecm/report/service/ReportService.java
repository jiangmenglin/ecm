package com.ecm.report.service;

import com.ecm.common.PageResult;
import com.ecm.component.entity.CompCategory;
import com.ecm.component.entity.CompInfo;
import com.ecm.component.repository.CompCategoryRepository;
import com.ecm.component.repository.CompInfoRepository;
import com.ecm.inventory.entity.InvBatch;
import com.ecm.inventory.entity.InvOperationLog;
import com.ecm.inventory.entity.InvStock;
import com.ecm.inventory.repository.InvBatchRepository;
import com.ecm.inventory.repository.InvOperationLogRepository;
import com.ecm.inventory.repository.InvStockRepository;
import com.ecm.report.dto.OperationLogDTO;
import com.ecm.report.dto.StaleReportDTO;
import com.ecm.report.dto.TurnoverReportDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final InvStockRepository invStockRepository;
    private final InvBatchRepository invBatchRepository;
    private final InvOperationLogRepository invOperationLogRepository;
    private final CompInfoRepository compInfoRepository;
    private final CompCategoryRepository compCategoryRepository;

    /**
     * Inventory summary dashboard: total items, total quantity, low stock count, expired batch count.
     */
    public Map<String, Object> getInventorySummary() {
        List<InvStock> allStocks = invStockRepository.findAllActive();
        List<InvStock> lowStocks = invStockRepository.findLowStockItems();
        List<InvBatch> expiredBatches = invBatchRepository.findByStatusAndDeleted("EXPIRED", 0);

        BigDecimal totalQuantity = allStocks.stream()
                .map(InvStock::getQuantity)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long uniqueComponents = allStocks.stream()
                .map(InvStock::getComponentId)
                .distinct()
                .count();

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalStockItems", allStocks.size());
        summary.put("uniqueComponents", uniqueComponents);
        summary.put("totalQuantity", totalQuantity);
        summary.put("lowStockCount", lowStocks.size());
        summary.put("expiredBatchCount", expiredBatches.size());
        return summary;
    }

    /**
     * Turnover report: per-component turnover metrics with pagination.
     */
    public PageResult<TurnoverReportDTO> getTurnoverReport(int page, int size) {
        List<InvStock> allStocks = invStockRepository.findAllActive();

        // Group stocks by componentId and calculate average stock per component
        Map<Long, BigDecimal> stockByComponent = allStocks.stream()
                .collect(Collectors.groupingBy(
                        InvStock::getComponentId,
                        Collectors.reducing(BigDecimal.ZERO, InvStock::getQuantity, BigDecimal::add)
                ));

        // Get all operation logs to calculate inbound/outbound per component
        List<InvOperationLog> allLogs = invOperationLogRepository.findAll();

        Map<Long, BigDecimal> inboundByComponent = new HashMap<>();
        Map<Long, BigDecimal> outboundByComponent = new HashMap<>();

        for (InvOperationLog log : allLogs) {
            if ("INBOUND".equals(log.getOperationType())) {
                inboundByComponent.merge(log.getComponentId(), log.getQuantity(), BigDecimal::add);
            } else if ("OUTBOUND".equals(log.getOperationType())) {
                outboundByComponent.merge(log.getComponentId(), log.getQuantity(), BigDecimal::add);
            }
        }

        // Build DTO list for all components that have stock
        List<TurnoverReportDTO> allResults = new ArrayList<>();

        // Load component and category info in batch
        Map<Long, CompInfo> compMap = compInfoRepository.findAll().stream()
                .collect(Collectors.toMap(CompInfo::getId, c -> c, (a, b) -> a));
        Map<Long, CompCategory> catMap = compCategoryRepository.findAll().stream()
                .collect(Collectors.toMap(CompCategory::getId, c -> c, (a, b) -> a));

        for (Map.Entry<Long, BigDecimal> entry : stockByComponent.entrySet()) {
            Long compId = entry.getKey();
            BigDecimal avgStock = entry.getValue();
            BigDecimal totalIn = inboundByComponent.getOrDefault(compId, BigDecimal.ZERO);
            BigDecimal totalOut = outboundByComponent.getOrDefault(compId, BigDecimal.ZERO);

            BigDecimal rate = BigDecimal.ZERO;
            if (avgStock.compareTo(BigDecimal.ZERO) > 0) {
                rate = totalOut.divide(avgStock, 2, RoundingMode.HALF_UP);
            }

            int days = 0;
            if (rate.compareTo(BigDecimal.ZERO) > 0) {
                days = 365 / rate.intValue();
            }

            CompInfo comp = compMap.get(compId);
            String internalPn = comp != null ? comp.getInternalPn() : "";
            String compName = comp != null ? comp.getComponentName() : "";
            String catName = "";
            if (comp != null && comp.getCategoryId() != null) {
                CompCategory cat = catMap.get(comp.getCategoryId());
                if (cat != null) catName = cat.getCategoryName();
            }

            allResults.add(new TurnoverReportDTO(
                    compId, internalPn, compName, catName,
                    totalIn, totalOut, avgStock, rate, days
            ));
        }

        // Sort by turnoverRate descending
        allResults.sort((a, b) -> b.getTurnoverRate().compareTo(a.getTurnoverRate()));

        // Apply pagination
        int total = allResults.size();
        int fromIndex = Math.min((page - 1) * size, total);
        int toIndex = Math.min(fromIndex + size, total);
        List<TurnoverReportDTO> pageList = allResults.subList(fromIndex, toIndex);

        return new PageResult<>(pageList, (long) total, page, size);
    }

    /**
     * Stale material report: components with no outbound movement for a given threshold, with pagination.
     */
    public PageResult<StaleReportDTO> getStaleReport(int daysThreshold, int page, int size) {
        LocalDateTime threshold = LocalDateTime.now().minusDays(daysThreshold);
        List<InvStock> allStocks = invStockRepository.findAllActive();

        // Load component and category info in batch
        Map<Long, CompInfo> compMap = compInfoRepository.findAll().stream()
                .collect(Collectors.toMap(CompInfo::getId, c -> c, (a, b) -> a));
        Map<Long, CompCategory> catMap = compCategoryRepository.findAll().stream()
                .collect(Collectors.toMap(CompCategory::getId, c -> c, (a, b) -> a));

        List<StaleReportDTO> allResults = new ArrayList<>();

        for (InvStock stock : allStocks) {
            if (stock.getQuantity().compareTo(BigDecimal.ZERO) <= 0) continue;

            List<InvOperationLog> logs = invOperationLogRepository
                    .findByComponentIdOrderByOperationTimeDesc(stock.getComponentId());

            // Check last outbound
            LocalDateTime lastOutbound = null;
            for (InvOperationLog log : logs) {
                if ("OUTBOUND".equals(log.getOperationType())) {
                    lastOutbound = log.getOperationTime();
                    break;
                }
            }

            boolean isStale = (lastOutbound == null && !logs.isEmpty())
                    || (lastOutbound != null && lastOutbound.isBefore(threshold))
                    || (logs.isEmpty());

            if (!isStale) continue;

            int staleDays;
            String lastOutboundDate = null;
            if (lastOutbound != null) {
                staleDays = (int) java.time.Duration.between(lastOutbound, LocalDateTime.now()).toDays();
                lastOutboundDate = lastOutbound.toLocalDate().toString();
            } else {
                staleDays = daysThreshold + 365; // No outbound ever, use a large number
            }

            CompInfo comp = compMap.get(stock.getComponentId());
            String internalPn = comp != null ? comp.getInternalPn() : "";
            String compName = comp != null ? comp.getComponentName() : "";
            String catName = "";
            if (comp != null && comp.getCategoryId() != null) {
                CompCategory cat = catMap.get(comp.getCategoryId());
                if (cat != null) catName = cat.getCategoryName();
            }

            // Estimate stale value (qty * unit price if available, otherwise 0)
            BigDecimal staleValue = BigDecimal.ZERO;

            allResults.add(new StaleReportDTO(
                    stock.getComponentId(), internalPn, compName, catName,
                    stock.getQuantity(), lastOutboundDate, staleDays, staleValue
            ));
        }

        // Sort by staleDays descending
        allResults.sort((a, b) -> Integer.compare(b.getStaleDays(), a.getStaleDays()));

        // Apply pagination
        int total = allResults.size();
        int fromIndex = Math.min((page - 1) * size, total);
        int toIndex = Math.min(fromIndex + size, total);
        List<StaleReportDTO> pageList = allResults.subList(fromIndex, toIndex);

        return new PageResult<>(pageList, (long) total, page, size);
    }

    /**
     * Operation logs report with optional filters and pagination.
     */
    public PageResult<OperationLogDTO> getOperationLogs(String module, String operator,
                                                         LocalDate startDate, LocalDate endDate,
                                                         int page, int size) {
        List<InvOperationLog> logs;

        if (startDate != null && endDate != null) {
            LocalDateTime startDateTime = startDate.atStartOfDay();
            LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);
            logs = invOperationLogRepository.findByTimeRange(startDateTime, endDateTime);
        } else {
            // Default: last 30 days
            LocalDateTime startDateTime = LocalDateTime.now().minusDays(30);
            logs = invOperationLogRepository.findByTimeRange(startDateTime, LocalDateTime.now());
        }

        // Map to DTO
        List<OperationLogDTO> allResults = logs.stream()
                .map(log -> new OperationLogDTO(
                        log.getId(),
                        mapOperationTypeToModule(log.getOperationType()),
                        mapOperationTypeToOperation(log.getOperationType()),
                        log.getOperatorName() != null ? log.getOperatorName() : "",
                        log.getRefOrderNo() != null ? log.getRefOrderNo() : "",
                        log.getRemark() != null ? log.getRemark() : "",
                        "",
                        log.getOperationTime() != null ? log.getOperationTime().toString() : ""
                ))
                .collect(Collectors.toList());

        // Apply optional filters
        if (module != null && !module.isEmpty()) {
            allResults = allResults.stream()
                    .filter(dto -> module.equals(dto.getModule()))
                    .collect(Collectors.toList());
        }
        if (operator != null && !operator.isEmpty()) {
            allResults = allResults.stream()
                    .filter(dto -> dto.getOperator().contains(operator))
                    .collect(Collectors.toList());
        }

        // Apply pagination
        int total = allResults.size();
        int fromIndex = Math.min((page - 1) * size, total);
        int toIndex = Math.min(fromIndex + size, total);
        List<OperationLogDTO> pageList = allResults.subList(fromIndex, toIndex);

        return new PageResult<>(pageList, (long) total, page, size);
    }

    private String mapOperationTypeToModule(String operationType) {
        if (operationType == null) return "其他";
        switch (operationType) {
            case "INBOUND":
                return "入库管理";
            case "OUTBOUND":
                return "出库管理";
            case "STOCK_IN":
            case "STOCK_OUT":
            case "TRANSFER":
            case "COUNT":
                return "库存管理";
            default:
                return "其他";
        }
    }

    private String mapOperationTypeToOperation(String operationType) {
        if (operationType == null) return "未知操作";
        switch (operationType) {
            case "INBOUND":
                return "入库";
            case "OUTBOUND":
                return "出库";
            case "STOCK_IN":
                return "库存入库";
            case "STOCK_OUT":
                return "库存出库";
            case "TRANSFER":
                return "库存调拨";
            case "COUNT":
                return "库存盘点";
            default:
                return operationType;
        }
    }

    /**
     * Threshold alerts: items below safety stock or min stock.
     */
    public List<InvStock> getThresholdAlerts() {
        return invStockRepository.findLowStockItems();
    }

    /**
     * Full dashboard data combining multiple metrics.
     */
    public Map<String, Object> getDashboard() {
        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("inventorySummary", getInventorySummary());
        dashboard.put("lowStockAlerts", getThresholdAlerts());

        List<InvBatch> expiredBatches = invBatchRepository.findByStatusAndDeleted("EXPIRED", 0);
        dashboard.put("expiredBatches", expiredBatches.size());

        List<InvBatch> normalBatches = invBatchRepository.findByStatusAndDeleted("NORMAL", 0);
        dashboard.put("activeBatches", normalBatches.size());

        return dashboard;
    }
}
