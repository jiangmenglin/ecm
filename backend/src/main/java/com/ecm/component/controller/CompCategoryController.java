package com.ecm.component.controller;

import com.ecm.common.Result;
import com.ecm.component.dto.CategoryDTO;
import com.ecm.component.service.CompCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/components/categories")
@RequiredArgsConstructor
public class CompCategoryController {

    private final CompCategoryService compCategoryService;

    @GetMapping("/tree")
    public Result<List<CategoryDTO>> getTree() {
        return Result.ok(compCategoryService.getCategoryTree());
    }

    @GetMapping("/{id}")
    public Result<CategoryDTO> getById(@PathVariable Long id) {
        return Result.ok(compCategoryService.getById(id));
    }

    @PostMapping
    public Result<CategoryDTO> create(@RequestBody CategoryDTO dto) {
        return Result.ok(compCategoryService.create(dto));
    }

    @PutMapping("/{id}")
    public Result<CategoryDTO> update(@PathVariable Long id, @RequestBody CategoryDTO dto) {
        return Result.ok(compCategoryService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        compCategoryService.delete(id);
        return Result.ok();
    }
}
