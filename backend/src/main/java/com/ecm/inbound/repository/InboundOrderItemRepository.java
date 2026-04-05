package com.ecm.inbound.repository;

import com.ecm.inbound.entity.InboundOrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InboundOrderItemRepository extends JpaRepository<InboundOrderItem, Long> {

    List<InboundOrderItem> findByInboundId(Long inboundId);
}
