package com.ecm.inbound.service;

import com.ecm.common.BusinessException;
import com.ecm.inbound.dto.PurchaseOrderDTO;
import com.ecm.inbound.entity.PurchaseOrder;
import com.ecm.inbound.entity.PurchaseOrderItem;
import com.ecm.inbound.repository.PurchaseOrderItemRepository;
import com.ecm.inbound.repository.PurchaseOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@RequiredArgsConstructor
public class PurchaseOrderService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final PurchaseOrderItemRepository purchaseOrderItemRepository;

    public List<PurchaseOrder> listAll() {
        return purchaseOrderRepository.findByDeletedOrderByIdDesc(0);
    }

    public PurchaseOrder getById(Long id) {
        return purchaseOrderRepository.findByIdAndDeleted(id, 0)
                .orElseThrow(() -> new BusinessException("Purchase order not found"));
    }

    public List<PurchaseOrderItem> getItems(Long poId) {
        return purchaseOrderItemRepository.findByPoId(poId);
    }

    @Transactional
    public PurchaseOrder create(PurchaseOrderDTO dto) {
        String poNo = generatePoNo();
        PurchaseOrder po = PurchaseOrder.builder()
                .poNo(poNo)
                .supplierId(dto.getSupplierId())
                .orderDate(dto.getOrderDate() != null ? dto.getOrderDate() : LocalDate.now())
                .expectedDate(dto.getExpectedDate())
                .currency(dto.getCurrency() != null ? dto.getCurrency() : "CNY")
                .status("DRAFT")
                .buyerId(dto.getBuyerId())
                .notes(dto.getNotes())
                .build();

        BigDecimal totalAmount = BigDecimal.ZERO;
        PurchaseOrder saved = purchaseOrderRepository.save(po);

        if (dto.getItems() != null) {
            for (PurchaseOrderDTO.PurchaseOrderItemDTO itemDTO : dto.getItems()) {
                PurchaseOrderItem item = PurchaseOrderItem.builder()
                        .poId(saved.getId())
                        .componentId(itemDTO.getComponentId())
                        .quantity(itemDTO.getQuantity())
                        .unitPrice(itemDTO.getUnitPrice())
                        .amount(itemDTO.getUnitPrice() != null && itemDTO.getQuantity() != null
                                ? itemDTO.getUnitPrice().multiply(itemDTO.getQuantity()) : null)
                        .requiredDate(itemDTO.getRequiredDate())
                        .notes(itemDTO.getNotes())
                        .build();
                if (item.getAmount() != null) {
                    totalAmount = totalAmount.add(item.getAmount());
                }
                purchaseOrderItemRepository.save(item);
            }
        }

        saved.setTotalAmount(totalAmount);
        return purchaseOrderRepository.save(saved);
    }

    @Transactional
    public PurchaseOrder updateStatus(Long id, String status) {
        PurchaseOrder po = getById(id);
        po.setStatus(status);
        return purchaseOrderRepository.save(po);
    }

    @Transactional
    public void delete(Long id) {
        PurchaseOrder po = getById(id);
        po.setDeleted(1);
        purchaseOrderRepository.save(po);
    }

    private String generatePoNo() {
        String date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long count = purchaseOrderRepository.count() + 1;
        return "PO" + date + String.format("%04d", count);
    }
}
