package com.ecm.alert.service;

import com.ecm.alert.entity.AlertRecord;
import com.ecm.alert.entity.AlertRule;
import com.ecm.alert.repository.AlertRecordRepository;
import com.ecm.alert.repository.AlertRuleRepository;
import com.ecm.common.BusinessException;
import com.ecm.component.entity.CompInfo;
import com.ecm.component.repository.CompInfoRepository;
import com.ecm.inventory.entity.InvBatch;
import com.ecm.inventory.entity.InvStock;
import com.ecm.inventory.repository.InvBatchRepository;
import com.ecm.inventory.repository.InvStockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AlertService {

    private final AlertRuleRepository alertRuleRepository;
    private final AlertRecordRepository alertRecordRepository;
    private final InvStockRepository invStockRepository;
    private final InvBatchRepository invBatchRepository;
    private final CompInfoRepository compInfoRepository;

    public List<AlertRule> listRules() {
        return alertRuleRepository.findByDeletedOrderByIdDesc(0);
    }

    public AlertRule getRuleById(Long id) {
        return alertRuleRepository.findById(id)
                .filter(r -> r.getDeleted() == 0)
                .orElseThrow(() -> new BusinessException("Alert rule not found"));
    }

    @Transactional
    public AlertRule createRule(AlertRule rule) {
        return alertRuleRepository.save(rule);
    }

    @Transactional
    public AlertRule updateRule(Long id, AlertRule ruleUpdate) {
        AlertRule rule = getRuleById(id);
        if (ruleUpdate.getRuleName() != null) rule.setRuleName(ruleUpdate.getRuleName());
        if (ruleUpdate.getRuleType() != null) rule.setRuleType(ruleUpdate.getRuleType());
        if (ruleUpdate.getTargetType() != null) rule.setTargetType(ruleUpdate.getTargetType());
        if (ruleUpdate.getTargetId() != null) rule.setTargetId(ruleUpdate.getTargetId());
        if (ruleUpdate.getThresholdValue() != null) rule.setThresholdValue(ruleUpdate.getThresholdValue());
        if (ruleUpdate.getThresholdUnit() != null) rule.setThresholdUnit(ruleUpdate.getThresholdUnit());
        if (ruleUpdate.getAdvanceDays() != null) rule.setAdvanceDays(ruleUpdate.getAdvanceDays());
        if (ruleUpdate.getNotifyMethod() != null) rule.setNotifyMethod(ruleUpdate.getNotifyMethod());
        if (ruleUpdate.getNotifyUsers() != null) rule.setNotifyUsers(ruleUpdate.getNotifyUsers());
        if (ruleUpdate.getEnabled() != null) rule.setEnabled(ruleUpdate.getEnabled());
        return alertRuleRepository.save(rule);
    }

    @Transactional
    public void deleteRule(Long id) {
        AlertRule rule = getRuleById(id);
        rule.setDeleted(1);
        alertRuleRepository.save(rule);
    }

    public List<AlertRecord> listAlerts(String status, String alertType) {
        if (status != null) {
            return alertRecordRepository.findByStatusOrderByCreatedAtDesc(status);
        }
        if (alertType != null) {
            return alertRecordRepository.findByAlertTypeOrderByCreatedAtDesc(alertType);
        }
        return alertRecordRepository.findAllByOrderByCreatedAtDesc();
    }

    public AlertRecord getAlertById(Long id) {
        return alertRecordRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Alert record not found"));
    }

    @Transactional
    public AlertRecord handleAlert(Long id, Long handledBy, String handleRemark) {
        AlertRecord record = getAlertById(id);
        record.setStatus("RESOLVED");
        record.setHandledBy(handledBy);
        record.setHandleTime(LocalDateTime.now());
        record.setHandleRemark(handleRemark);
        return alertRecordRepository.save(record);
    }

    @Transactional
    public AlertRecord ignoreAlert(Long id, Long handledBy, String handleRemark) {
        AlertRecord record = getAlertById(id);
        record.setStatus("IGNORED");
        record.setHandledBy(handledBy);
        record.setHandleTime(LocalDateTime.now());
        record.setHandleRemark(handleRemark);
        return alertRecordRepository.save(record);
    }

    /**
     * Check all enabled rules and generate alert records.
     */
    @Transactional
    public int checkAndGenerateAlerts() {
        List<AlertRule> rules = alertRuleRepository.findByEnabledAndDeleted(1, 0);
        int count = 0;
        for (AlertRule rule : rules) {
            switch (rule.getRuleType()) {
                case "STOCK_LOW" -> count += checkStockLow(rule);
                case "EXPIRY" -> count += checkExpiry(rule);
                case "STALE" -> count += checkStale(rule);
                default -> {}
            }
        }
        return count;
    }

    private int checkStockLow(AlertRule rule) {
        List<InvStock> lowStocks = invStockRepository.findLowStockItems();
        int count = 0;
        for (InvStock stock : lowStocks) {
            String compName = compInfoRepository.findById(stock.getComponentId())
                    .map(CompInfo::getComponentName).orElse("Unknown");
            AlertRecord record = AlertRecord.builder()
                    .ruleId(rule.getId())
                    .alertType("STOCK_LOW")
                    .alertLevel("WARNING")
                    .componentId(stock.getComponentId())
                    .componentName(compName)
                    .warehouseId(stock.getWarehouseId())
                    .title("Low stock alert: " + compName)
                    .content("Component " + compName + " current quantity " + stock.getQuantity()
                            + " is below minimum stock " + stock.getMinStock())
                    .status("PENDING")
                    .build();
            alertRecordRepository.save(record);
            count++;
        }
        return count;
    }

    private int checkExpiry(AlertRule rule) {
        LocalDate checkDate = LocalDate.now().plusDays(rule.getAdvanceDays() != null ? rule.getAdvanceDays() : 30);
        List<InvBatch> batches = invBatchRepository.findByExpiryDateBeforeAndStatusAndDeleted(
                checkDate, "NORMAL", 0);
        int count = 0;
        for (InvBatch batch : batches) {
            String compName = compInfoRepository.findById(batch.getComponentId())
                    .map(CompInfo::getComponentName).orElse("Unknown");
            AlertRecord record = AlertRecord.builder()
                    .ruleId(rule.getId())
                    .alertType("EXPIRY")
                    .alertLevel("CRITICAL")
                    .componentId(batch.getComponentId())
                    .componentName(compName)
                    .title("Expiry alert: " + compName + " batch " + batch.getBatchCode())
                    .content("Batch " + batch.getBatchCode() + " of " + compName
                            + " will expire on " + batch.getExpiryDate())
                    .status("PENDING")
                    .build();
            alertRecordRepository.save(record);
            count++;
        }
        return count;
    }

    private int checkStale(AlertRule rule) {
        List<InvStock> allStocks = invStockRepository.findAllActive();
        int thresholdDays = rule.getThresholdValue() != null ? rule.getThresholdValue().intValue() : 90;
        int count = 0;
        for (InvStock stock : allStocks) {
            if (stock.getQuantity().compareTo(BigDecimal.ZERO) > 0 && stock.getCreatedAt() != null) {
                long daysSinceCreation = java.time.temporal.ChronoUnit.DAYS.between(
                        stock.getCreatedAt().toLocalDate(), LocalDate.now());
                if (daysSinceCreation > thresholdDays) {
                    String compName = compInfoRepository.findById(stock.getComponentId())
                            .map(CompInfo::getComponentName).orElse("Unknown");
                    AlertRecord record = AlertRecord.builder()
                            .ruleId(rule.getId())
                            .alertType("STALE")
                            .alertLevel("INFO")
                            .componentId(stock.getComponentId())
                            .componentName(compName)
                            .warehouseId(stock.getWarehouseId())
                            .title("Stale material alert: " + compName)
                            .content("Component " + compName + " has been in stock for " + daysSinceCreation + " days")
                            .status("PENDING")
                            .build();
                    alertRecordRepository.save(record);
                    count++;
                }
            }
        }
        return count;
    }
}
