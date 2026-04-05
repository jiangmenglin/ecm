package com.ecm.report.controller;

import com.ecm.common.PageResult;
import com.ecm.common.Result;
import com.ecm.inventory.entity.InvStock;
import com.ecm.report.dto.OperationLogDTO;
import com.ecm.report.dto.StaleReportDTO;
import com.ecm.report.dto.TurnoverReportDTO;
import com.ecm.report.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/dashboard")
    public Result<Map<String, Object>> getDashboard() {
        return Result.ok(reportService.getDashboard());
    }

    @GetMapping("/inventory-summary")
    public Result<Map<String, Object>> getInventorySummary() {
        return Result.ok(reportService.getInventorySummary());
    }

    @GetMapping("/turnover")
    public Result<PageResult<TurnoverReportDTO>> getTurnoverReport(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        return Result.ok(reportService.getTurnoverReport(page, size));
    }

    @GetMapping("/stale")
    public Result<PageResult<StaleReportDTO>> getStaleReport(
            @RequestParam(defaultValue = "90") int daysThreshold,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        return Result.ok(reportService.getStaleReport(daysThreshold, page, size));
    }

    @GetMapping("/alerts")
    public Result<List<InvStock>> getThresholdAlerts() {
        return Result.ok(reportService.getThresholdAlerts());
    }

    @GetMapping("/operation-logs")
    public Result<PageResult<OperationLogDTO>> getOperationLogs(
            @RequestParam(required = false) String module,
            @RequestParam(required = false) String operator,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        return Result.ok(reportService.getOperationLogs(module, operator, startDate, endDate, page, size));
    }
}
