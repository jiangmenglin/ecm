package com.ecm.component.controller;

import com.ecm.common.Result;
import com.ecm.component.entity.CompSubstitute;
import com.ecm.component.service.CompSubstituteService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/components/{id}/substitutes")
@RequiredArgsConstructor
public class CompSubstituteController {

    private final CompSubstituteService compSubstituteService;

    @GetMapping
    public Result<List<CompSubstitute>> list(@PathVariable Long id) {
        return Result.ok(compSubstituteService.getByComponentId(id));
    }

    @PostMapping
    public Result<CompSubstitute> add(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return Result.ok(compSubstituteService.add(id, body));
    }

    @DeleteMapping("/{subId}")
    public Result<Void> delete(@PathVariable Long id, @PathVariable Long subId) {
        compSubstituteService.delete(subId);
        return Result.ok();
    }
}
