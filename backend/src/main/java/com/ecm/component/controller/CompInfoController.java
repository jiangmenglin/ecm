package com.ecm.component.controller;

import com.ecm.common.PageResult;
import com.ecm.common.Result;
import com.ecm.component.dto.ComponentDTO;
import com.ecm.component.dto.ComponentQueryDTO;
import com.ecm.component.service.CompInfoService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/components")
@RequiredArgsConstructor
public class CompInfoController {

    private final CompInfoService compInfoService;

    @GetMapping
    public Result<PageResult<ComponentDTO>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String manufacturer,
            @RequestParam(required = false) String packageType,
            @RequestParam(required = false) String lifecycleStatus,
            @RequestParam(required = false) Integer status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize) {
        ComponentQueryDTO query = new ComponentQueryDTO();
        query.setKeyword(keyword);
        query.setCategoryId(categoryId);
        query.setManufacturer(manufacturer);
        query.setPackageType(packageType);
        query.setLifecycleStatus(lifecycleStatus);
        query.setStatus(status);
        return Result.ok(compInfoService.search(query, page, pageSize));
    }

    @GetMapping("/{id}")
    public Result<ComponentDTO> getById(@PathVariable Long id) {
        return Result.ok(compInfoService.getById(id));
    }

    @GetMapping("/pn/{internalPn}")
    public Result<ComponentDTO> getByInternalPn(@PathVariable String internalPn) {
        return Result.ok(compInfoService.getByInternalPn(internalPn));
    }

    @PostMapping
    public Result<ComponentDTO> create(@RequestBody ComponentDTO dto) {
        return Result.ok(compInfoService.create(dto));
    }

    @PutMapping("/{id}")
    public Result<ComponentDTO> update(@PathVariable Long id, @RequestBody ComponentDTO dto) {
        return Result.ok(compInfoService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        compInfoService.delete(id);
        return Result.ok();
    }
}
