package com.ecm.component.service;

import com.ecm.component.entity.CompSubstitute;
import com.ecm.component.repository.CompSubstituteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CompSubstituteService {

    private final CompSubstituteRepository compSubstituteRepository;

    public List<CompSubstitute> getByComponentId(Long componentId) {
        return compSubstituteRepository.findByComponentIdOrderByPriority(componentId);
    }

    @Transactional
    public CompSubstitute add(Long componentId, Map<String, Object> body) {
        CompSubstitute sub = CompSubstitute.builder()
                .componentId(componentId)
                .substituteId(((Number) body.get("substituteId")).longValue())
                .priority(body.get("priority") != null ? ((Number) body.get("priority")).intValue() : 1)
                .compatibility(body.get("compatibility") != null ? (String) body.get("compatibility") : "FULL")
                .notes((String) body.get("notes"))
                .build();
        return compSubstituteRepository.save(sub);
    }

    @Transactional
    public void delete(Long id) {
        compSubstituteRepository.deleteById(id);
    }
}
