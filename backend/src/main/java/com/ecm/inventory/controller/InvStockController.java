package com.ecm.inventory.controller;

import com.ecm.common.PageResult;
import com.ecm.common.Result;
import com.ecm.inventory.dto.StockDTO;
import com.ecm.inventory.dto.StockQueryDTO;
import com.ecm.inventory.service.InvStockService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory/stocks")
@RequiredArgsConstructor
public class InvStockController {

    private final InvStockService invStockService;

    @GetMapping
    public Result<PageResult<StockDTO>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long warehouseId,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize) {
        StockQueryDTO query = new StockQueryDTO();
        query.setKeyword(keyword);
        query.setWarehouseId(warehouseId);
        query.setCategoryId(categoryId);
        query.setStatus(status);
        return Result.ok(invStockService.search(query, page, pageSize));
    }

    @GetMapping("/{id}")
    public Result<StockDTO> getById(@PathVariable Long id) {
        return Result.ok(invStockService.getById(id));
    }

    @GetMapping("/dashboard")
    public Result<List<StockDTO>> dashboard() {
        return Result.ok(invStockService.getStockDashboard());
    }

    @GetMapping("/low-stock")
    public Result<List<StockDTO>> lowStock() {
        return Result.ok(invStockService.getLowStockItems().stream()
                .map(s -> invStockService.getById(s.getId()))
                .toList());
    }
}
