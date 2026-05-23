INSERT INTO meetup (title, location_label, time_label, cover_url, joined_count, total_slots, status, created_at, updated_at)
VALUES
(
    '周六寿司午饭',
    '静安区',
    '周六 12:00',
    'https://images.unsplash.com/photo-1579584432223-c7ecc17ec883?w=900&auto=format&fit=crop&q=80',
    4,
    8,
    'PUBLISHED',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    '牛排馆午餐',
    '上海外滩',
    '今天 12:30',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&auto=format&fit=crop&q=80',
    3,
    4,
    'PUBLISHED',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    '老城厢早茶',
    '上海城隍庙',
    '明天 11:00',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&auto=format&fit=crop&q=80',
    1,
    6,
    'PUBLISHED',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);
