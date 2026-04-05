package com.ecm.outbound.controller;

import com.ecm.common.Result;
import com.ecm.outbound.dto.BomDTO;
import com.ecm.outbound.entity.Bom;
import com.ecm.outbound.entity.BomItem;
import com.ecm.outbound.service.BomService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/outbound/boms")
@RequiredArgsConstructor
public class BomController {

    private final BomService bomService;

    @GetMapping
    public Result<List<Bom>> list() {
        return Result.ok(bomService.listAll());
    }

    @GetMapping("/{id}")
    public Result<Bom> getById(@PathVariable Long id) {
        return Result.ok(bomService.getById(id));
    }

    @GetMapping("/{id}/items")
    public Result<List<BomItem>> getItems(@PathVariable Long id) {
        return Result.ok(bomService.getItems(id));
    }

    @PostMapping
    public Result<Bom> create(@RequestBody BomDTO dto) {
        return Result.ok(bomService.create(dto));
    }

    @PutMapping("/{id}")
    public Result<Bom> update(@PathVariable Long id, @RequestBody BomDTO dto) {
        return Result.ok(bomService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        bomService.delete(id);
        return Result.ok();
    }
}
