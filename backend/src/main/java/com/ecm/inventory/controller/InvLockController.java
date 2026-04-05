package com.ecm.inventory.controller;

import com.ecm.common.Result;
import com.ecm.inventory.entity.InvLock;
import com.ecm.inventory.service.InvLockService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inventory/locks")
@RequiredArgsConstructor
public class InvLockController {

    private final InvLockService invLockService;

    @GetMapping
    public Result<List<InvLock>> listActive() {
        return Result.ok(invLockService.getAllActive());
    }

    @GetMapping("/stock/{stockId}")
    public Result<List<InvLock>> getByStock(@PathVariable Long stockId) {
        return Result.ok(invLockService.getByStockId(stockId));
    }

    @PostMapping
    public Result<InvLock> lock(@RequestBody Map<String, Object> body) {
        return Result.ok(invLockService.lock(body));
    }

    @PostMapping("/{id}/release")
    public Result<InvLock> release(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        Long releasedBy = body.get("releasedBy") != null ? ((Number) body.get("releasedBy")).longValue() : null;
        return Result.ok(invLockService.release(id, releasedBy));
    }
}
