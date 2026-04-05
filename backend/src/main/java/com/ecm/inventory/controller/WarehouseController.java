package com.ecm.inventory.controller;

import com.ecm.common.Result;
import com.ecm.inventory.dto.WarehouseDTO;
import com.ecm.inventory.entity.Warehouse;
import com.ecm.inventory.service.WarehouseService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory/warehouses")
@RequiredArgsConstructor
public class WarehouseController {

    private final WarehouseService warehouseService;

    @GetMapping
    public Result<List<Warehouse>> list() {
        return Result.ok(warehouseService.listAll());
    }

    @GetMapping("/{id}")
    public Result<Warehouse> getById(@PathVariable Long id) {
        return Result.ok(warehouseService.getById(id));
    }

    @PostMapping
    public Result<Warehouse> create(@RequestBody WarehouseDTO dto) {
        return Result.ok(warehouseService.create(dto));
    }

    @PutMapping("/{id}")
    public Result<Warehouse> update(@PathVariable Long id, @RequestBody WarehouseDTO dto) {
        return Result.ok(warehouseService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        warehouseService.delete(id);
        return Result.ok();
    }
}
