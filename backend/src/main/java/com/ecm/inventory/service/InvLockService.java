package com.ecm.inventory.service;

import com.ecm.common.BusinessException;
import com.ecm.inventory.entity.InvLock;
import com.ecm.inventory.entity.InvStock;
import com.ecm.inventory.repository.InvLockRepository;
import com.ecm.inventory.repository.InvStockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class InvLockService {

    private final InvLockRepository invLockRepository;
    private final InvStockRepository invStockRepository;

    public List<InvLock> getByStockId(Long stockId) {
        return invLockRepository.findByStockIdAndStatus(stockId, "LOCKED");
    }

    public List<InvLock> getAllActive() {
        return invLockRepository.findByStatus("LOCKED");
    }

    @Transactional
    public InvLock lock(Map<String, Object> body) {
        Long stockId = ((Number) body.get("stockId")).longValue();
        InvStock stock = invStockRepository.findByIdAndDeleted(stockId, 0)
                .orElseThrow(() -> new BusinessException("Stock not found"));

        BigDecimal lockQty = new BigDecimal(body.get("lockQty").toString());
        BigDecimal availableQty = stock.getQuantity().subtract(stock.getReservedQty());
        if (lockQty.compareTo(availableQty) > 0) {
            throw new BusinessException("Insufficient available quantity to lock");
        }

        stock.setReservedQty(stock.getReservedQty().add(lockQty));
        invStockRepository.save(stock);

        InvLock lock = InvLock.builder()
                .stockId(stockId)
                .lockType((String) body.getOrDefault("lockType", "MANUAL"))
                .lockRefId((String) body.get("lockRefId"))
                .lockQty(lockQty)
                .reason((String) body.get("reason"))
                .lockedBy(body.get("lockedBy") != null ? ((Number) body.get("lockedBy")).longValue() : null)
                .status("LOCKED")
                .build();
        return invLockRepository.save(lock);
    }

    @Transactional
    public InvLock release(Long lockId, Long releasedBy) {
        InvLock lock = invLockRepository.findById(lockId)
                .orElseThrow(() -> new BusinessException("Lock record not found"));
        if ("RELEASED".equals(lock.getStatus())) {
            throw new BusinessException("Lock already released");
        }

        InvStock stock = invStockRepository.findByIdAndDeleted(lock.getStockId(), 0)
                .orElseThrow(() -> new BusinessException("Stock not found"));
        stock.setReservedQty(stock.getReservedQty().subtract(lock.getLockQty()));
        invStockRepository.save(stock);

        lock.setStatus("RELEASED");
        lock.setReleasedBy(releasedBy);
        lock.setReleaseTime(LocalDateTime.now());
        return invLockRepository.save(lock);
    }
}
