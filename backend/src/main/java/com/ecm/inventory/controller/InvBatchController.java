package com.ecm.inventory.controller;

import com.ecm.common.PageResult;
import com.ecm.common.Result;
import com.ecm.inventory.dto.BatchDTO;
import com.ecm.inventory.entity.InvBatch;
import com.ecm.inventory.service.InvBatchService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory/batches")
@RequiredArgsConstructor
public class InvBatchController {

    private final InvBatchService invBatchService;

    @GetMapping
    public Result<PageResult<InvBatch>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String keyword) {
        return Result.ok(invBatchService.list(page, size, keyword));
    }

    @GetMapping("/component/{componentId}")
    public Result<List<InvBatch>> getByComponent(@PathVariable Long componentId) {
        return Result.ok(invBatchService.getByComponentId(componentId));
    }

    @GetMapping("/{id}")
    public Result<InvBatch> getById(@PathVariable Long id) {
        return Result.ok(invBatchService.getById(id));
    }

    @PostMapping
    public Result<InvBatch> create(@RequestBody BatchDTO dto) {
        return Result.ok(invBatchService.create(dto));
    }

    @PostMapping("/check-expiry")
    public Result<List<InvBatch>> checkExpiry() {
        return Result.ok(invBatchService.checkExpiry());
    }

    @PostMapping("/{id}/bake")
    public Result<InvBatch> recordBake(@PathVariable Long id) {
        return Result.ok(invBatchService.recordBake(id));
    }

    @PostMapping("/{id}/msd-check")
    public Result<Void> checkMsd(@PathVariable Long id) {
        invBatchService.updateMsdExposure(id);
        return Result.ok();
    }
}
