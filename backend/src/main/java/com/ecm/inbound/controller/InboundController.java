package com.ecm.inbound.controller;

import com.ecm.common.Result;
import com.ecm.inbound.dto.InboundOrderDTO;
import com.ecm.inbound.entity.InboundOrder;
import com.ecm.inbound.entity.InboundOrderItem;
import com.ecm.inbound.service.InboundService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inbound/orders")
@RequiredArgsConstructor
public class InboundController {

    private final InboundService inboundService;

    @GetMapping
    public Result<List<InboundOrder>> list() {
        return Result.ok(inboundService.listAll());
    }

    @GetMapping("/{id}")
    public Result<InboundOrder> getById(@PathVariable Long id) {
        return Result.ok(inboundService.getById(id));
    }

    @GetMapping("/{id}/items")
    public Result<List<InboundOrderItem>> getItems(@PathVariable Long id) {
        return Result.ok(inboundService.getItems(id));
    }

    @PostMapping
    public Result<InboundOrder> create(@RequestBody InboundOrderDTO dto) {
        return Result.ok(inboundService.create(dto));
    }

    @PostMapping("/{id}/complete")
    public Result<InboundOrder> complete(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        Long operatorId = body.get("operatorId") != null ? ((Number) body.get("operatorId")).longValue() : null;
        return Result.ok(inboundService.completeInbound(id, operatorId));
    }

    @PutMapping("/{id}/status")
    public Result<InboundOrder> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return Result.ok(inboundService.updateStatus(id, body.get("status")));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        inboundService.delete(id);
        return Result.ok();
    }
}
