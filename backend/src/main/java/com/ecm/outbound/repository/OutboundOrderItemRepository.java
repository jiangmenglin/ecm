package com.ecm.outbound.repository;

import com.ecm.outbound.entity.OutboundOrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OutboundOrderItemRepository extends JpaRepository<OutboundOrderItem, Long> {

    List<OutboundOrderItem> findByOutboundId(Long outboundId);
}
