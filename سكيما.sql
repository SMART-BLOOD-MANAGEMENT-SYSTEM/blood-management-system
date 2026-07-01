-- ============================================================
--   SMART BLOOD MANAGEMENT SYSTEM — DATABASE SCHEMA v2
--   الخطوة 1: حذف الجداول والأنواع القديمة
--   الخطوة 2: إنشاء الأنواع والجداول الجديدة
-- ============================================================


-- ============================================================
-- STEP 1: حذف الجداول القديمة (بالترتيب الصح)
-- ============================================================

DROP TABLE IF EXISTS notifications        CASCADE;
DROP TABLE IF EXISTS blood_disbursements  CASCADE;
DROP TABLE IF EXISTS blood_requests       CASCADE;
DROP TABLE IF EXISTS blood_inventory      CASCADE;
DROP TABLE IF EXISTS appointments         CASCADE;
DROP TABLE IF EXISTS donation_slots       CASCADE;
DROP TABLE IF EXISTS blood_banks          CASCADE;
DROP TABLE IF EXISTS users                CASCADE;

-- حذف الأنواع القديمة لو موجودة
DROP TYPE IF EXISTS blood_type_enum CASCADE;
DROP TYPE IF EXISTS role_enum        CASCADE;
DROP TYPE IF EXISTS gender_enum      CASCADE;


-- ============================================================
-- STEP 2: إنشاء الـ ENUM TYPES
-- لازم تنشأ قبل الجداول
-- ============================================================

CREATE TYPE blood_type_enum AS ENUM (
    'A+', 'A-',
    'B+', 'B-',
    'AB+', 'AB-',
    'O+', 'O-'
);

CREATE TYPE role_enum AS ENUM (
    'donor',
    'admin',
    'doctor'
);

CREATE TYPE gender_enum AS ENUM (
    'male',
    'female'
);


-- ============================================================
-- 1. USERS
-- ============================================================
CREATE TABLE users (
    id              SERIAL PRIMARY KEY,
    full_name       VARCHAR(100)     NOT NULL,
    email           VARCHAR(100)     UNIQUE NOT NULL,
    password_hash   TEXT             NOT NULL,
    phone           VARCHAR(20)      UNIQUE,
    role            role_enum        NOT NULL DEFAULT 'donor',
    blood_type      blood_type_enum,
    gender          gender_enum,
    birth_date      DATE,
    city            VARCHAR(50),
    is_eligible     BOOLEAN          DEFAULT TRUE,
    created_at      TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP        DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- 2. BLOOD BANKS
-- ============================================================
CREATE TABLE blood_banks (
    id               SERIAL PRIMARY KEY,
    name             VARCHAR(100)    NOT NULL,
    city             VARCHAR(50),
    address          TEXT,
    latitude         DECIMAL(10,8),
    longitude        DECIMAL(11,8),
    contact_number   VARCHAR(20),
    email            VARCHAR(100),
    created_at       TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- 3. DONATION SLOTS
-- بدون booked_count لأنه بيتحسب من appointments
-- ============================================================
CREATE TABLE donation_slots (
    id            SERIAL PRIMARY KEY,
    bank_id       INT          NOT NULL,
    slot_date     DATE         NOT NULL,
    start_time    TIME         NOT NULL,
    end_time      TIME         NOT NULL,
    max_capacity  INT          NOT NULL CHECK (max_capacity > 0),

    CONSTRAINT time_check CHECK (start_time < end_time),

    CONSTRAINT fk_slot_bank
        FOREIGN KEY (bank_id)
        REFERENCES blood_banks(id)
        ON DELETE CASCADE
);


-- ============================================================
-- 4. APPOINTMENTS
-- ============================================================
CREATE TABLE appointments (
    id                  SERIAL PRIMARY KEY,
    user_id             INT          NOT NULL,
    slot_id             INT          NOT NULL,
    appointment_status  VARCHAR(20)  DEFAULT 'pending'
                            CHECK (appointment_status IN (
                                'pending','confirmed','cancelled','completed'
                            )),
    notes               TEXT,
    created_at          TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT unique_user_slot UNIQUE (user_id, slot_id),

    CONSTRAINT fk_appointment_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_appointment_slot
        FOREIGN KEY (slot_id)
        REFERENCES donation_slots(id)
        ON DELETE CASCADE
);


-- ============================================================
-- 5. BLOOD INVENTORY
-- appointment_id nullable عشان مش كل وحدة دم جاءت من موعد
-- ============================================================
CREATE TABLE blood_inventory (
    id               SERIAL PRIMARY KEY,
    bank_id          INT              NOT NULL,
    appointment_id   INT,                        -- nullable
    blood_type       blood_type_enum  NOT NULL,
    quantity_units   INT              NOT NULL CHECK (quantity_units >= 0),
    expiration_date  DATE,
    last_updated     TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_inventory_bank
        FOREIGN KEY (bank_id)
        REFERENCES blood_banks(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_inventory_appointment
        FOREIGN KEY (appointment_id)
        REFERENCES appointments(id)
        ON DELETE SET NULL
);


-- ============================================================
-- 6. BLOOD REQUESTS
-- ============================================================
CREATE TABLE blood_requests (
    id              SERIAL PRIMARY KEY,
    bank_id         INT              NOT NULL,
    patient_name    VARCHAR(100),
    blood_type      blood_type_enum  NOT NULL,
    required_units  INT              NOT NULL CHECK (required_units > 0),
    urgency_level   VARCHAR(20)      DEFAULT 'normal'
                        CHECK (urgency_level IN (
                            'low','normal','urgent','critical'
                        )),
    status          VARCHAR(20)      DEFAULT 'pending'
                        CHECK (status IN (
                            'pending','fulfilled','cancelled'
                        )),
    request_date    TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_request_bank
        FOREIGN KEY (bank_id)
        REFERENCES blood_banks(id)
        ON DELETE CASCADE
);


-- ============================================================
-- 7. BLOOD DISBURSEMENTS
-- جدول وسيط بين الطلبات والمخزون
-- يوضح أي وحدة دم راحت لأي طلب
-- ============================================================
CREATE TABLE blood_disbursements (
    id            SERIAL PRIMARY KEY,
    request_id    INT    NOT NULL,
    inventory_id  INT    NOT NULL,
    units_used    INT    NOT NULL CHECK (units_used > 0),
    dispatched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_disbursement_request
        FOREIGN KEY (request_id)
        REFERENCES blood_requests(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_disbursement_inventory
        FOREIGN KEY (inventory_id)
        REFERENCES blood_inventory(id)
        ON DELETE CASCADE
);


-- ============================================================
-- 8. NOTIFICATIONS
-- ============================================================
CREATE TABLE notifications (
    id          SERIAL PRIMARY KEY,
    user_id     INT          NOT NULL,
    title       VARCHAR(100),
    message     TEXT,
    type        VARCHAR(20)  CHECK (type IN (
                    'emergency','reminder','confirmation','general'
                )),
    is_read     BOOLEAN      DEFAULT FALSE,
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notification_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


-- ============================================================
-- INDEXES — لتسريع عمليات البحث
-- ============================================================

CREATE INDEX idx_users_blood_type      ON users(blood_type);
CREATE INDEX idx_users_city            ON users(city);
CREATE INDEX idx_users_is_eligible     ON users(is_eligible);
CREATE INDEX idx_banks_city            ON blood_banks(city);
CREATE INDEX idx_inventory_blood_type  ON blood_inventory(blood_type);
CREATE INDEX idx_inventory_bank_id     ON blood_inventory(bank_id);
CREATE INDEX idx_inventory_expiry      ON blood_inventory(expiration_date);
CREATE INDEX idx_requests_status       ON blood_requests(status);
CREATE INDEX idx_requests_urgency      ON blood_requests(urgency_level);
CREATE INDEX idx_notif_user_unread     ON notifications(user_id, is_read);
CREATE INDEX idx_appt_user_id          ON appointments(user_id);
CREATE INDEX idx_slots_date            ON donation_slots(slot_date);


-- ============================================================
-- END OF SCHEMA v2
-- ============================================================