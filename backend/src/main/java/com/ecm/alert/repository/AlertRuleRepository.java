package com.ecm.alert.repository;

import com.ecm.alert.entity.AlertRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlertRuleRepository extends JpaRepository<AlertRule, Long> {

    List<AlertRule> findByEnabledAndDeleted(Integer enabled, Integer deleted);

    List<AlertRule> findByDeletedOrderByIdDesc(Integer deleted);
}
