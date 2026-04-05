package com.ecm.inbound.controller;

import com.ecm.common.Result;
import com.ecm.inbound.dto.PurchaseOrderDTO;
import com.ecm.inbound.entity.PurchaseOrder;
import com.ecm.inbound.entity.PurchaseOrderItem;
import com.ecm.inbound.service.PurchaseOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inbound/purchase-orders")
@RequiredArgsConstructor
public class PurchaseOrderController {

    private final PurchaseOrderService purchaseOrderService;

    @GetMapping
    public Result<List<PurchaseOrder>> list() {
        return Result.ok(purchaseOrderService.listAll());
    }

    @GetMapping("/{id}")
    public Result<PurchaseOrder> getById(@PathVariable Long id) {
        return Result.ok(purchaseOrderService.getById(id));
    }

    @GetMapping("/{id}/items")
    public Result<List<PurchaseOrderItem>> getItems(@PathVariable Long id) {
        return Result.ok(purchaseOrderService.getItems(id));
    }

    @PostMapping
    public Result<PurchaseOrder> create(@RequestBody PurchaseOrderDTO dto) {
        return Result.ok(purchaseOrderService.create(dto));
    }

    @PutMapping("/{id}/status")
    public Result<PurchaseOrder> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return Result.ok(purchaseOrderService.updateStatus(id, body.get("status")));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        purchaseOrderService.delete(id);
        return Result.ok();
    }
}
