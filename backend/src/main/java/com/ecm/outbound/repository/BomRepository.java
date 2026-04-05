package com.ecm.outbound.repository;

import com.ecm.outbound.entity.Bom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BomRepository extends JpaRepository<Bom, Long> {

    List<Bom> findByDeletedOrderByIdDesc(Integer deleted);

    Optional<Bom> findByIdAndDeleted(Long id, Integer deleted);

    Optional<Bom> findByBomCode(String bomCode);
}
