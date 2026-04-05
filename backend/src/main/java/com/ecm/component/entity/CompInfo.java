package com.ecm.component.entity;

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
@Table(name = "comp_info")
@EntityListeners(AuditingEntityListener.class)
public class CompInfo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "category_id", nullable = false)
    private Long categoryId;

    @Column(name = "internal_pn", nullable = false, unique = true, length = 80)
    private String internalPn;

    @Column(name = "manufacturer_pn", length = 80)
    private String manufacturerPn;

    @Column(name = "manufacturer", length = 200)
    private String manufacturer;

    @Column(name = "component_name", nullable = false, length = 200)
    private String componentName;

    @Column(name = "package_type", length = 50)
    private String packageType;

    @Column(name = "package_unit", length = 20)
    @Builder.Default
    private String packageUnit = "个";

    @Column(name = "min_package_qty")
    @Builder.Default
    private Integer minPackageQty = 1;

    @Column(name = "lifecycle_status", length = 20)
    @Builder.Default
    private String lifecycleStatus = "ACTIVE";

    @Column(name = "msd_level")
    private Integer msdLevel;

    @Column(name = "esd_sensitive")
    @Builder.Default
    private Integer esdSensitive = 0;

    @Column(name = "esd_class", length = 20)
    private String esdClass;

    @Column(name = "shelf_life_days")
    private Integer shelfLifeDays;

    @Column(name = "temperature_range", length = 50)
    private String temperatureRange;

    @Column(name = "humidity_range", length = 50)
    private String humidityRange;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "datasheet_url", length = 500)
    private String datasheetUrl;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

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
