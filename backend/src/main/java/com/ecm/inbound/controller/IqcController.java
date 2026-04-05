package com.ecm.inbound.controller;

import com.ecm.common.PageResult;
import com.ecm.common.Result;
import com.ecm.inbound.dto.IqcRecordDTO;
import com.ecm.inbound.entity.IqcRecord;
import com.ecm.inbound.service.IqcService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inbound/iqc")
@RequiredArgsConstructor
public class IqcController {

    private final IqcService iqcService;

    @GetMapping
    public Result<PageResult<IqcRecord>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status) {
        return Result.ok(iqcService.list(page, size, status));
    }

    @GetMapping("/inbound-item/{inboundItemId}")
    public Result<List<IqcRecord>> getByInboundItem(@PathVariable Long inboundItemId) {
        return Result.ok(iqcService.getByInboundItem(inboundItemId));
    }

    @GetMapping("/component/{componentId}")
    public Result<List<IqcRecord>> getByComponent(@PathVariable Long componentId) {
        return Result.ok(iqcService.getByComponent(componentId));
    }

    @PostMapping
    public Result<IqcRecord> inspect(@RequestBody IqcRecordDTO dto) {
        return Result.ok(iqcService.inspect(dto));
    }
}
