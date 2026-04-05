package com.ecm.inventory.service;

import com.ecm.common.BusinessException;
import com.ecm.inventory.dto.WarehouseDTO;
import com.ecm.inventory.entity.Warehouse;
import com.ecm.inventory.repository.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WarehouseService {

    private final WarehouseRepository warehouseRepository;

    public List<Warehouse> listAll() {
        return warehouseRepository.findByDeletedOrderByCreatedAtDesc(0);
    }

    public Warehouse getById(Long id) {
        return warehouseRepository.findByIdAndDeleted(id, 0)
                .orElseThrow(() -> new BusinessException("Warehouse not found"));
    }

    @Transactional
    public Warehouse create(WarehouseDTO dto) {
        Warehouse entity = Warehouse.builder()
                .warehouseCode(dto.getWarehouseCode())
                .warehouseName(dto.getWarehouseName())
                .warehouseType(dto.getWarehouseType() != null ? dto.getWarehouseType() : "NORMAL")
                .address(dto.getAddress())
                .managerId(dto.getManagerId())
                .temperatureMin(dto.getTemperatureMin())
                .temperatureMax(dto.getTemperatureMax())
                .humidityMin(dto.getHumidityMin())
                .humidityMax(dto.getHumidityMax())
                .esdProtected(dto.getEsdProtected() != null ? dto.getEsdProtected() : 0)
                .status(dto.getStatus() != null ? dto.getStatus() : 1)
                .description(dto.getDescription())
                .build();
        return warehouseRepository.save(entity);
    }

    @Transactional
    public Warehouse update(Long id, WarehouseDTO dto) {
        Warehouse entity = getById(id);
        if (dto.getWarehouseName() != null) entity.setWarehouseName(dto.getWarehouseName());
        if (dto.getWarehouseType() != null) entity.setWarehouseType(dto.getWarehouseType());
        if (dto.getAddress() != null) entity.setAddress(dto.getAddress());
        if (dto.getManagerId() != null) entity.setManagerId(dto.getManagerId());
        if (dto.getTemperatureMin() != null) entity.setTemperatureMin(dto.getTemperatureMin());
        if (dto.getTemperatureMax() != null) entity.setTemperatureMax(dto.getTemperatureMax());
        if (dto.getHumidityMin() != null) entity.setHumidityMin(dto.getHumidityMin());
        if (dto.getHumidityMax() != null) entity.setHumidityMax(dto.getHumidityMax());
        if (dto.getEsdProtected() != null) entity.setEsdProtected(dto.getEsdProtected());
        if (dto.getStatus() != null) entity.setStatus(dto.getStatus());
        if (dto.getDescription() != null) entity.setDescription(dto.getDescription());
        return warehouseRepository.save(entity);
    }

    @Transactional
    public void delete(Long id) {
        Warehouse entity = getById(id);
        entity.setDeleted(1);
        warehouseRepository.save(entity);
    }
}
