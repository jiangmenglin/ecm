package com.ecm.alert.controller;

import com.ecm.alert.entity.AlertRecord;
import com.ecm.alert.entity.AlertRule;
import com.ecm.alert.service.AlertService;
import com.ecm.common.Result;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
public class AlertController {

    private final AlertService alertService;

    // ---- Alert Rules ----

    @GetMapping("/rules")
    public Result<List<AlertRule>> listRules() {
        return Result.ok(alertService.listRules());
    }

    @GetMapping("/rules/{id}")
    public Result<AlertRule> getRule(@PathVariable Long id) {
        return Result.ok(alertService.getRuleById(id));
    }

    @PostMapping("/rules")
    public Result<AlertRule> createRule(@RequestBody AlertRule rule) {
        return Result.ok(alertService.createRule(rule));
    }

    @PutMapping("/rules/{id}")
    public Result<AlertRule> updateRule(@PathVariable Long id, @RequestBody AlertRule rule) {
        return Result.ok(alertService.updateRule(id, rule));
    }

    @DeleteMapping("/rules/{id}")
    public Result<Void> deleteRule(@PathVariable Long id) {
        alertService.deleteRule(id);
        return Result.ok();
    }

    // ---- Alert Records ----

    @GetMapping
    public Result<List<AlertRecord>> listAlerts(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String alertType) {
        return Result.ok(alertService.listAlerts(status, alertType));
    }

    @GetMapping("/{id}")
    public Result<AlertRecord> getAlert(@PathVariable Long id) {
        return Result.ok(alertService.getAlertById(id));
    }

    @PostMapping("/{id}/handle")
    public Result<AlertRecord> handleAlert(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        Long handledBy = body.get("handledBy") != null ? ((Number) body.get("handledBy")).longValue() : null;
        String handleRemark = (String) body.get("handleRemark");
        return Result.ok(alertService.handleAlert(id, handledBy, handleRemark));
    }

    @PostMapping("/{id}/ignore")
    public Result<AlertRecord> ignoreAlert(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        Long handledBy = body.get("handledBy") != null ? ((Number) body.get("handledBy")).longValue() : null;
        String handleRemark = (String) body.get("handleRemark");
        return Result.ok(alertService.ignoreAlert(id, handledBy, handleRemark));
    }

    @PostMapping("/check")
    public Result<Map<String, Object>> triggerCheck() {
        int count = alertService.checkAndGenerateAlerts();
        return Result.ok(Map.of("generatedAlerts", count));
    }
}
