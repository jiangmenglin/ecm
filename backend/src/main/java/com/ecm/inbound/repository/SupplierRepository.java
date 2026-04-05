package com.ecm.inbound.repository;

import com.ecm.inbound.entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {

    List<Supplier> findByDeletedOrderByIdDesc(Integer deleted);

    Optional<Supplier> findByIdAndDeleted(Long id, Integer deleted);

    Optional<Supplier> findBySupplierCode(String supplierCode);
}
