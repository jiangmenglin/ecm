package com.ecm.outbound.repository;

import com.ecm.outbound.entity.OutboundOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OutboundOrderRepository extends JpaRepository<OutboundOrder, Long> {

    List<OutboundOrder> findByDeletedOrderByIdDesc(Integer deleted);

    Optional<OutboundOrder> findByIdAndDeleted(Long id, Integer deleted);

    Optional<OutboundOrder> findByOutboundNo(String outboundNo);
}
