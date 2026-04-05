package com.ecm.outbound.controller;

import com.ecm.common.Result;
import com.ecm.outbound.dto.OutboundOrderDTO;
import com.ecm.outbound.entity.OutboundOrder;
import com.ecm.outbound.entity.OutboundOrderItem;
import com.ecm.outbound.service.OutboundService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/outbound/orders")
@RequiredArgsConstructor
public class OutboundController {

    private final OutboundService outboundService;

    @GetMapping
    public Result<List<OutboundOrder>> list() {
        return Result.ok(outboundService.listAll());
    }

    @GetMapping("/{id}")
    public Result<OutboundOrder> getById(@PathVariable Long id) {
        return Result.ok(outboundService.getById(id));
    }

    @GetMapping("/{id}/items")
    public Result<List<OutboundOrderItem>> getItems(@PathVariable Long id) {
        return Result.ok(outboundService.getItems(id));
    }

    @PostMapping
    public Result<OutboundOrder> create(@RequestBody OutboundOrderDTO dto) {
        return Result.ok(outboundService.create(dto));
    }

    @PostMapping("/from-bom")
    public Result<OutboundOrder> createFromBom(@RequestBody Map<String, Object> body) {
        Long bomId = ((Number) body.get("bomId")).longValue();
        Long warehouseId = ((Number) body.get("warehouseId")).longValue();
        String outboundType = (String) body.get("outboundType");
        String productionOrderNo = (String) body.get("productionOrderNo");
        String targetLocation = (String) body.get("targetLocation");
        Long applicantId = body.get("applicantId") != null ? ((Number) body.get("applicantId")).longValue() : null;
        String notes = (String) body.get("notes");
        return Result.ok(outboundService.createFromBom(bomId, warehouseId, outboundType,
                productionOrderNo, targetLocation, applicantId, notes));
    }

    @PostMapping("/{id}/complete")
    public Result<OutboundOrder> complete(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        Long operatorId = body.get("operatorId") != null ? ((Number) body.get("operatorId")).longValue() : null;
        return Result.ok(outboundService.completeOutbound(id, operatorId));
    }

    @PostMapping("/items/{itemId}/pick")
    public Result<OutboundOrderItem> pickItem(@PathVariable Long itemId, @RequestBody Map<String, Object> body) {
        String barcode = (String) body.get("barcode");
        BigDecimal actualQty = body.get("actualQty") != null ? new BigDecimal(body.get("actualQty").toString()) : null;
        return Result.ok(outboundService.verifyAndPick(itemId, barcode, actualQty));
    }

    @PutMapping("/{id}/status")
    public Result<OutboundOrder> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return Result.ok(outboundService.updateStatus(id, body.get("status")));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        outboundService.delete(id);
        return Result.ok();
    }
}
