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
@Table(name = "comp_substitute")
@EntityListeners(AuditingEntityListener.class)
public class CompSubstitute {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "component_id", nullable = false)
    private Long componentId;

    @Column(name = "substitute_id", nullable = false)
    private Long substituteId;

    @Column(name = "priority")
    @Builder.Default
    private Integer priority = 1;

    @Column(name = "compatibility", length = 20)
    @Builder.Default
    private String compatibility = "FULL";

    @Column(name = "notes", length = 500)
    private String notes;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
