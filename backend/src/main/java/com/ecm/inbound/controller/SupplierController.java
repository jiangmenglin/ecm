package com.ecm.inbound.controller;

import com.ecm.common.Result;
import com.ecm.inbound.dto.SupplierDTO;
import com.ecm.inbound.entity.Supplier;
import com.ecm.inbound.service.SupplierService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inbound/suppliers")
@RequiredArgsConstructor
public class SupplierController {

    private final SupplierService supplierService;

    @GetMapping
    public Result<List<Supplier>> list() {
        return Result.ok(supplierService.listAll());
    }

    @GetMapping("/{id}")
    public Result<Supplier> getById(@PathVariable Long id) {
        return Result.ok(supplierService.getById(id));
    }

    @PostMapping
    public Result<Supplier> create(@RequestBody SupplierDTO dto) {
        return Result.ok(supplierService.create(dto));
    }

    @PutMapping("/{id}")
    public Result<Supplier> update(@PathVariable Long id, @RequestBody SupplierDTO dto) {
        return Result.ok(supplierService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        supplierService.delete(id);
        return Result.ok();
    }
}
