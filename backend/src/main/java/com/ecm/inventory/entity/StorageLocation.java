package com.ecm.inventory.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "storage_location")
@EntityListeners(AuditingEntityListener.class)
public class StorageLocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "warehouse_id", nullable = false)
    private Long warehouseId;

    @Column(name = "location_code", nullable = false, length = 50)
    private String locationCode;

    @Column(name = "location_name", length = 100)
    private String locationName;

    @Column(name = "location_type", length = 20)
    @Builder.Default
    private String locationType = "SHELF";

    @Column(name = "row_num")
    private Integer rowNum;

    @Column(name = "column_num")
    private Integer columnNum;

    @Column(name = "layer_num")
    private Integer layerNum;

    @Column(name = "max_capacity")
    private Integer maxCapacity;

    @Column(name = "current_usage")
    @Builder.Default
    private Integer currentUsage = 0;

    @Column(name = "esd_safe")
    @Builder.Default
    private Integer esdSafe = 0;

    @Column(name = "status")
    @Builder.Default
    private Integer status = 1;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "deleted")
    @Builder.Default
    private Integer deleted = 0;
}
