package com.ecm.component.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "comp_parameter")
@EntityListeners(AuditingEntityListener.class)
public class CompParameter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "component_id", nullable = false)
    private Long componentId;

    @Column(name = "param_name", nullable = false, length = 100)
    private String paramName;

    @Column(name = "param_value", nullable = false, length = 200)
    private String paramValue;

    @Column(name = "param_unit", length = 30)
    private String paramUnit;

    @Column(name = "sort_order")
    @Builder.Default
    private Integer sortOrder = 0;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
