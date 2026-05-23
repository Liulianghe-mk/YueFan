package com.yuefan.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "recommend_spot")
@Getter
@Setter
public class RecommendSpot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(name = "image_url", nullable = false, length = 1024)
    private String imageUrl;

    @Column(nullable = false)
    private double rating = 5.0;

    @Column(nullable = false, length = 500)
    private String tags = "";

    @Column(name = "price_yuan", nullable = false)
    private int priceYuan;

    @Column(nullable = false, length = 300)
    private String address = "";

    @Column(name = "business_hours", nullable = false, length = 200)
    private String businessHours = "";

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;

    @Column(nullable = false, length = 32)
    private String status = "DRAFT";

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
