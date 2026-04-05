package com.ecm.inbound.repository;

import com.ecm.inbound.entity.InboundOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InboundOrderRepository extends JpaRepository<InboundOrder, Long> {

    List<InboundOrder> findByDeletedOrderByIdDesc(Integer deleted);

    Optional<InboundOrder> findByIdAndDeleted(Long id, Integer deleted);

    Optional<InboundOrder> findByInboundNo(String inboundNo);

    List<InboundOrder> findByPoIdAndDeleted(Long poId, Integer deleted);
}
