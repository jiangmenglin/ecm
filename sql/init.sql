-- =====================================================
-- 电子元件管理系统 (ECM) 数据库初始化脚本
-- =====================================================

SET NAMES utf8mb4;
SET sql_mode = 'NO_ENGINE_SUBSTITUTION';
SET FOREIGN_KEY_CHECKS = 0;

DROP DATABASE IF EXISTS ecm_db;
CREATE DATABASE IF NOT EXISTS ecm_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ecm_db;

-- =====================================================
-- 一、系统管理模块
-- =====================================================

-- 系统用户
CREATE TABLE sys_user (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(200) NOT NULL,
    real_name VARCHAR(50),
    email VARCHAR(100),
    phone VARCHAR(20),
    avatar VARCHAR(255),
    status TINYINT DEFAULT 1 COMMENT '1-正常 0-禁用',
    last_login_time DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0
) ENGINE=InnoDB COMMENT='系统用户';

-- 系统角色
CREATE TABLE sys_role (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    role_code VARCHAR(50) NOT NULL UNIQUE,
    role_name VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    status TINYINT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0
) ENGINE=InnoDB COMMENT='系统角色';

-- 系统菜单/权限
CREATE TABLE sys_menu (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    parent_id BIGINT DEFAULT 0,
    menu_name VARCHAR(100) NOT NULL,
    menu_type TINYINT COMMENT '1-目录 2-菜单 3-按钮',
    path VARCHAR(255),
    component VARCHAR(255),
    permission VARCHAR(100),
    icon VARCHAR(100),
    sort_order INT DEFAULT 0,
    visible TINYINT DEFAULT 1,
    status TINYINT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0
) ENGINE=InnoDB COMMENT='系统菜单';

-- 用户-角色关联
CREATE TABLE sys_user_role (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    UNIQUE KEY uk_user_role (user_id, role_id)
) ENGINE=InnoDB COMMENT='用户角色关联';

-- 角色-菜单关联
CREATE TABLE sys_role_menu (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    role_id BIGINT NOT NULL,
    menu_id BIGINT NOT NULL,
    UNIQUE KEY uk_role_menu (role_id, menu_id)
) ENGINE=InnoDB COMMENT='角色菜单关联';

-- =====================================================
-- 二、元件管理模块
-- =====================================================

-- 元件分类（树形结构）
CREATE TABLE comp_category (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    parent_id BIGINT DEFAULT 0 COMMENT '父分类ID，0为顶级',
    category_code VARCHAR(50) NOT NULL UNIQUE COMMENT '分类编码，如 R-电阻 C-电容 IC-集成电路',
    category_name VARCHAR(100) NOT NULL COMMENT '分类名称',
    icon VARCHAR(100),
    sort_order INT DEFAULT 0,
    status TINYINT DEFAULT 1 COMMENT '1-启用 0-禁用',
    description VARCHAR(500),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0
) ENGINE=InnoDB COMMENT='元件分类';

-- 元件信息（核心主表）
CREATE TABLE comp_info (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    category_id BIGINT NOT NULL COMMENT '分类ID',
    internal_pn VARCHAR(80) NOT NULL UNIQUE COMMENT '内部物料编码',
    manufacturer_pn VARCHAR(80) COMMENT '制造商料号',
    manufacturer VARCHAR(200) COMMENT '制造商/品牌',
    component_name VARCHAR(200) NOT NULL COMMENT '元件名称',
    package_type VARCHAR(50) COMMENT '封装类型，如0805/SOT-23/QFP',
    package_unit VARCHAR(20) DEFAULT '个' COMMENT '计量单位：个/盘/卷/管',
    min_package_qty INT DEFAULT 1 COMMENT '最小包装数量',
    lifecycle_status VARCHAR(20) DEFAULT 'ACTIVE' COMMENT 'ACTIVE-活跃 NRND-不推荐新设计 EOL-停产 OBSOLETE-淘汰',
    msd_level TINYINT COMMENT '湿敏等级 1-8',
    esd_sensitive TINYINT DEFAULT 0 COMMENT '是否静电敏感 0-否 1-是',
    esd_class VARCHAR(20) COMMENT 'ESD等级，如Class 0/1/2/3',
    shelf_life_days INT COMMENT '保质期（天），用于有效期预警',
    temperature_range VARCHAR(50) COMMENT '存储温度范围',
    humidity_range VARCHAR(50) COMMENT '存储湿度范围',
    description TEXT COMMENT '详细描述',
    datasheet_url VARCHAR(500) COMMENT '数据手册链接',
    image_url VARCHAR(500) COMMENT '元件图片',
    status TINYINT DEFAULT 1 COMMENT '1-启用 0-禁用',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0,
    INDEX idx_category (category_id),
    INDEX idx_manufacturer_pn (manufacturer_pn),
    INDEX idx_lifecycle (lifecycle_status)
) ENGINE=InnoDB COMMENT='元件信息';

-- 元件参数（动态参数，支持自定义）
CREATE TABLE comp_parameter (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    component_id BIGINT NOT NULL COMMENT '元件ID',
    param_name VARCHAR(100) NOT NULL COMMENT '参数名称，如阻值/容值/耐压值',
    param_value VARCHAR(200) NOT NULL COMMENT '参数值',
    param_unit VARCHAR(30) COMMENT '参数单位，如Ω/μF/V',
    sort_order INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_component (component_id)
) ENGINE=InnoDB COMMENT='元件参数';

-- 元件替代料关系
CREATE TABLE comp_substitute (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    component_id BIGINT NOT NULL COMMENT '主料ID',
    substitute_id BIGINT NOT NULL COMMENT '替代料ID',
    priority INT DEFAULT 1 COMMENT '替代优先级，1最高',
    compatibility VARCHAR(20) DEFAULT 'FULL' COMMENT 'FULL-完全兼容 PARTIAL-部分兼容',
    notes VARCHAR(500) COMMENT '备注说明',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_substitute (component_id, substitute_id),
    INDEX idx_component (component_id)
) ENGINE=InnoDB COMMENT='元件替代料';

-- =====================================================
-- 三、仓库与库位管理
-- =====================================================

-- 仓库
CREATE TABLE warehouse (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    warehouse_code VARCHAR(30) NOT NULL UNIQUE COMMENT '仓库编码',
    warehouse_name VARCHAR(100) NOT NULL COMMENT '仓库名称',
    warehouse_type VARCHAR(20) DEFAULT 'NORMAL' COMMENT 'NORMAL-普通恒温恒湿-恒湿 DRY-干燥柜 FREEZER-冷冻',
    address VARCHAR(255),
    manager_id BIGINT COMMENT '负责人ID',
    temperature_min DECIMAL(5,2) COMMENT '最低温度',
    temperature_max DECIMAL(5,2) COMMENT '最高温度',
    humidity_min DECIMAL(5,2) COMMENT '最低湿度',
    humidity_max DECIMAL(5,2) COMMENT '最高湿度',
    esd_protected TINYINT DEFAULT 0 COMMENT '是否防静电区域',
    status TINYINT DEFAULT 1,
    description VARCHAR(500),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0
) ENGINE=InnoDB COMMENT='仓库';

-- 库位
CREATE TABLE storage_location (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    warehouse_id BIGINT NOT NULL COMMENT '仓库ID',
    location_code VARCHAR(50) NOT NULL COMMENT '库位编码，如A-01-03',
    location_name VARCHAR(100) COMMENT '库位名称',
    location_type VARCHAR(20) DEFAULT 'SHELF' COMMENT 'SHELF-货架 BIN-料箱 CABINET-防静电柜 DRUM-料桶',
    row_num INT COMMENT '排',
    column_num INT COMMENT '列',
    layer_num INT COMMENT '层',
    max_capacity INT COMMENT '最大容量',
    current_usage INT DEFAULT 0 COMMENT '当前使用量',
    esd_safe TINYINT DEFAULT 0 COMMENT '是否防静电安全',
    status TINYINT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0,
    UNIQUE KEY uk_location_code (warehouse_id, location_code),
    INDEX idx_warehouse (warehouse_id)
) ENGINE=InnoDB COMMENT='库位';

-- =====================================================
-- 四、库存管理模块
-- =====================================================

-- 库存批次
CREATE TABLE inv_batch (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    component_id BIGINT NOT NULL COMMENT '元件ID',
    batch_code VARCHAR(80) NOT NULL COMMENT '批次号',
    supplier_batch VARCHAR(80) COMMENT '供应商批次号',
    supplier_id BIGINT COMMENT '供应商ID',
    manufacture_date DATE COMMENT '生产日期',
    expiry_date DATE COMMENT '有效期至',
    received_date DATE COMMENT '入库日期',
    origin_country VARCHAR(50) COMMENT '原产地',
    rohs_compliant TINYINT COMMENT '是否RoHS合规',
    msd_level TINYINT COMMENT '湿敏等级',
    floor_life_hours DECIMAL(8,2) COMMENT '车间寿命（小时）',
    exposure_start_time DATETIME COMMENT '暴露开始时间',
    exposure_duration_hours DECIMAL(8,2) DEFAULT 0 COMMENT '已暴露时间（小时）',
    bake_count INT DEFAULT 0 COMMENT '烘烤次数',
    last_bake_time DATETIME COMMENT '上次烘烤时间',
    remaining_floor_life DECIMAL(8,2) COMMENT '剩余车间寿命（小时）',
    status VARCHAR(20) DEFAULT 'NORMAL' COMMENT 'NORMAL-正常 EXPIRED-过期 LOCKED-锁定 QUARANTINE-隔离',
    notes VARCHAR(500),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0,
    UNIQUE KEY uk_batch (component_id, batch_code),
    INDEX idx_component (component_id),
    INDEX idx_expiry (expiry_date),
    INDEX idx_status (status)
) ENGINE=InnoDB COMMENT='库存批次';

-- 库存（实时库存汇总）
CREATE TABLE inv_stock (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    component_id BIGINT NOT NULL COMMENT '元件ID',
    warehouse_id BIGINT NOT NULL COMMENT '仓库ID',
    location_id BIGINT COMMENT '库位ID',
    batch_id BIGINT COMMENT '批次ID',
    quantity DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT '在库数量',
    reserved_qty DECIMAL(12,2) DEFAULT 0 COMMENT '已预留数量',
    in_transit_qty DECIMAL(12,2) DEFAULT 0 COMMENT '在途数量',
    inspecting_qty DECIMAL(12,2) DEFAULT 0 COMMENT '质检中数量',
    barcode VARCHAR(100) COMMENT '条形码',
    is_opened TINYINT DEFAULT 0 COMMENT '是否已拆包',
    remaining_in_package DECIMAL(12,2) COMMENT '拆包后剩余数量',
    safety_stock DECIMAL(12,2) DEFAULT 0 COMMENT '安全库存',
    min_stock DECIMAL(12,2) DEFAULT 0 COMMENT '最低库存',
    max_stock DECIMAL(12,2) DEFAULT 0 COMMENT '最高库存',
    last_count_date DATE COMMENT '最近盘点日期',
    status VARCHAR(20) DEFAULT 'NORMAL' COMMENT 'NORMAL-正常 FROZEN-冻结',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0,
    UNIQUE KEY uk_stock_location_batch (component_id, warehouse_id, location_id, batch_id),
    INDEX idx_component (component_id),
    INDEX idx_warehouse (warehouse_id),
    INDEX idx_barcode (barcode)
) ENGINE=InnoDB COMMENT='库存';

-- 库存锁定记录
CREATE TABLE inv_lock (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    stock_id BIGINT NOT NULL COMMENT '库存ID',
    lock_type VARCHAR(20) NOT NULL COMMENT 'ORDER-订单 PROJECT-项目 MANUAL-手动',
    lock_ref_id VARCHAR(80) COMMENT '关联单号',
    lock_qty DECIMAL(12,2) NOT NULL COMMENT '锁定数量',
    reason VARCHAR(500) COMMENT '锁定原因',
    locked_by BIGINT COMMENT '锁定人',
    lock_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    expected_release_time DATETIME COMMENT '预计释放时间',
    status VARCHAR(20) DEFAULT 'LOCKED' COMMENT 'LOCKED-已锁定 RELEASED-已释放',
    released_by BIGINT COMMENT '释放人',
    release_time DATETIME COMMENT '释放时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_stock (stock_id),
    INDEX idx_status (status)
) ENGINE=InnoDB COMMENT='库存锁定';

-- 库存操作日志
CREATE TABLE inv_operation_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    operation_type VARCHAR(30) NOT NULL COMMENT 'INBOUND/OUTBOUND/TRANSFER/COUNT/SPLIT/LOCK/UNLOCK',
    component_id BIGINT NOT NULL,
    batch_id BIGINT,
    warehouse_id BIGINT,
    location_id BIGINT,
    quantity DECIMAL(12,2),
    before_qty DECIMAL(12,2) COMMENT '操作前数量',
    after_qty DECIMAL(12,2) COMMENT '操作后数量',
    ref_order_no VARCHAR(80) COMMENT '关联单号',
    operator_id BIGINT COMMENT '操作人',
    operator_name VARCHAR(50),
    operation_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    remark VARCHAR(500),
    INDEX idx_component (component_id),
    INDEX idx_type_time (operation_type, operation_time),
    INDEX idx_operator (operator_id)
) ENGINE=InnoDB COMMENT='库存操作日志';

-- =====================================================
-- 五、供应商管理
-- =====================================================

CREATE TABLE supplier (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    supplier_code VARCHAR(50) NOT NULL UNIQUE COMMENT '供应商编码',
    supplier_name VARCHAR(200) NOT NULL COMMENT '供应商名称',
    short_name VARCHAR(100) COMMENT '简称',
    contact_person VARCHAR(50) COMMENT '联系人',
    phone VARCHAR(30) COMMENT '电话',
    email VARCHAR(100),
    address VARCHAR(500),
    website VARCHAR(255),
    qualification VARCHAR(20) DEFAULT 'QUALIFIED' COMMENT 'QUALIFIED-合格 PENDING-待审 DISQUALIFIED-不合格',
    payment_terms VARCHAR(100) COMMENT '付款条件',
    lead_time_days INT COMMENT '平均交货周期（天）',
    rating TINYINT COMMENT '评级 1-5',
    status TINYINT DEFAULT 1,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0
) ENGINE=InnoDB COMMENT='供应商';

-- =====================================================
-- 六、入库管理模块
-- =====================================================

-- 采购订单
CREATE TABLE purchase_order (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    po_no VARCHAR(50) NOT NULL UNIQUE COMMENT '采购订单号',
    supplier_id BIGINT NOT NULL COMMENT '供应商ID',
    order_date DATE NOT NULL COMMENT '订单日期',
    expected_date DATE COMMENT '预计到货日期',
    total_amount DECIMAL(14,2) COMMENT '总金额',
    currency VARCHAR(10) DEFAULT 'CNY',
    status VARCHAR(20) DEFAULT 'DRAFT' COMMENT 'DRAFT-草稿 SUBMITTED-已提交 CONFIRMED-已确认 RECEIVING-收货中 COMPLETED-已完成 CANCELLED-已取消',
    buyer_id BIGINT COMMENT '采购员ID',
    approver_id BIGINT COMMENT '审批人ID',
    approve_time DATETIME,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0,
    INDEX idx_supplier (supplier_id),
    INDEX idx_status (status)
) ENGINE=InnoDB COMMENT='采购订单';

-- 采购订单明细
CREATE TABLE purchase_order_item (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    po_id BIGINT NOT NULL COMMENT '采购订单ID',
    component_id BIGINT NOT NULL COMMENT '元件ID',
    quantity DECIMAL(12,2) NOT NULL COMMENT '采购数量',
    received_qty DECIMAL(12,2) DEFAULT 0 COMMENT '已收货数量',
    unit_price DECIMAL(10,4) COMMENT '单价',
    amount DECIMAL(14,2) COMMENT '金额',
    required_date DATE COMMENT '需求日期',
    notes VARCHAR(500),
    INDEX idx_po (po_id),
    INDEX idx_component (component_id)
) ENGINE=InnoDB COMMENT='采购订单明细';

-- 入库单
CREATE TABLE inbound_order (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    inbound_no VARCHAR(50) NOT NULL UNIQUE COMMENT '入库单号',
    po_id BIGINT COMMENT '关联采购订单ID',
    po_no VARCHAR(50) COMMENT '关联采购订单号',
    supplier_id BIGINT COMMENT '供应商ID',
    inbound_type VARCHAR(20) DEFAULT 'PURCHASE' COMMENT 'PURCHASE-采购入库 RETURN-退货入库 TRANSFER-调拨入库 OTHER-其他',
    warehouse_id BIGINT NOT NULL COMMENT '目标仓库',
    operator_id BIGINT COMMENT '操作人',
    inbound_date DATETIME COMMENT '入库日期',
    status VARCHAR(20) DEFAULT 'PENDING' COMMENT 'PENDING-待处理 INSPECTING-质检中 APPROVED-已通过 REJECTED-已拒绝 COMPLETED-已完成',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0,
    INDEX idx_po (po_id),
    INDEX idx_status (status)
) ENGINE=InnoDB COMMENT='入库单';

-- 入库单明细
CREATE TABLE inbound_order_item (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    inbound_id BIGINT NOT NULL COMMENT '入库单ID',
    component_id BIGINT NOT NULL COMMENT '元件ID',
    po_item_id BIGINT COMMENT '采购订单明细ID',
    batch_code VARCHAR(80) COMMENT '批次号',
    quantity DECIMAL(12,2) NOT NULL COMMENT '入库数量',
    location_id BIGINT COMMENT '存放库位',
    barcode VARCHAR(100) COMMENT '条码',
    qc_status VARCHAR(20) DEFAULT 'PENDING' COMMENT 'PENDING-待检 PASSED-合格 FAILED-不合格',
    notes VARCHAR(500),
    INDEX idx_inbound (inbound_id),
    INDEX idx_component (component_id)
) ENGINE=InnoDB COMMENT='入库单明细';

-- IQC质检记录
CREATE TABLE iqc_record (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    inbound_item_id BIGINT NOT NULL COMMENT '入库明细ID',
    component_id BIGINT NOT NULL COMMENT '元件ID',
    batch_id BIGINT COMMENT '批次ID',
    inspection_type VARCHAR(20) DEFAULT 'SAMPLING' COMMENT 'FULL-全检 SAMPLING-抽检',
    sample_size INT COMMENT '抽检数量',
    accept_qty INT DEFAULT 0 COMMENT '合格数量',
    reject_qty INT DEFAULT 0 COMMENT '不合格数量',
    appearance_result VARCHAR(10) COMMENT 'PASS/FAIL',
    function_result VARCHAR(10) COMMENT 'PASS/FAIL',
    pin_oxidation VARCHAR(10) COMMENT '引脚氧化检查 PASS/FAIL/NA',
    dimension_result VARCHAR(10) COMMENT 'PASS/FAIL/NA',
    result VARCHAR(10) NOT NULL COMMENT 'PASS/FAIL',
    inspector_id BIGINT COMMENT '检验员ID',
    inspection_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    failure_reason TEXT COMMENT '不合格原因',
    disposition VARCHAR(20) COMMENT 'ACCEPT-接收 RETURN-退货 SCRAP-报废 SORT-挑选',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_inbound_item (inbound_item_id),
    INDEX idx_component (component_id),
    INDEX idx_result (result)
) ENGINE=InnoDB COMMENT='IQC质检记录';

-- =====================================================
-- 七、出库管理模块
-- =====================================================

-- BOM（物料清单）
CREATE TABLE bom (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    bom_code VARCHAR(50) NOT NULL UNIQUE COMMENT 'BOM编码',
    product_name VARCHAR(200) NOT NULL COMMENT '产品名称',
    product_code VARCHAR(80) COMMENT '产品编码',
    version VARCHAR(20) DEFAULT '1.0' COMMENT '版本号',
    status VARCHAR(20) DEFAULT 'ACTIVE' COMMENT 'ACTIVE-活跃 OBSOLETE-废弃',
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0
) ENGINE=InnoDB COMMENT='BOM物料清单';

-- BOM明细
CREATE TABLE bom_item (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    bom_id BIGINT NOT NULL,
    component_id BIGINT NOT NULL COMMENT '元件ID',
    quantity DECIMAL(12,4) NOT NULL COMMENT '单位用量',
    unit VARCHAR(20) DEFAULT '个',
    reference_designator VARCHAR(200) COMMENT '位号，如R1,R2,C1',
    substitute_allowed TINYINT DEFAULT 0 COMMENT '是否允许替代料',
    notes VARCHAR(500),
    sort_order INT DEFAULT 0,
    INDEX idx_bom (bom_id),
    INDEX idx_component (component_id)
) ENGINE=InnoDB COMMENT='BOM明细';

-- 出库单
CREATE TABLE outbound_order (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    outbound_no VARCHAR(50) NOT NULL UNIQUE COMMENT '出库单号',
    outbound_type VARCHAR(20) NOT NULL COMMENT 'PRODUCTION-生产领料 R&D-研发领料 TRANSFER-调拨出库 SCRAP-报废 OTHER-其他',
    bom_id BIGINT COMMENT '关联BOM',
    production_order_no VARCHAR(80) COMMENT '生产工单号',
    target_location VARCHAR(200) COMMENT '目标位置/产线',
    warehouse_id BIGINT NOT NULL COMMENT '来源仓库',
    total_qty DECIMAL(12,2) COMMENT '总数量',
    applicant_id BIGINT COMMENT '申请人',
    approver_id BIGINT COMMENT '审批人',
    approve_time DATETIME,
    status VARCHAR(20) DEFAULT 'PENDING' COMMENT 'PENDING-待审批 APPROVED-已审批 PICKING-拣货中 SHIPPED-已出库 CANCELLED-已取消',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0,
    INDEX idx_type (outbound_type),
    INDEX idx_status (status)
) ENGINE=InnoDB COMMENT='出库单';

-- 出库单明细
CREATE TABLE outbound_order_item (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    outbound_id BIGINT NOT NULL COMMENT '出库单ID',
    component_id BIGINT NOT NULL COMMENT '元件ID',
    batch_id BIGINT COMMENT '出库批次（FIFO自动分配）',
    location_id BIGINT COMMENT '出库库位',
    required_qty DECIMAL(12,2) NOT NULL COMMENT '需求数量',
    actual_qty DECIMAL(12,2) DEFAULT 0 COMMENT '实际出库数量',
    barcode VARCHAR(100) COMMENT '扫描条码',
    picked TINYINT DEFAULT 0 COMMENT '是否已拣货',
    verified TINYINT DEFAULT 0 COMMENT '是否已校验',
    notes VARCHAR(500),
    INDEX idx_outbound (outbound_id),
    INDEX idx_component (component_id)
) ENGINE=InnoDB COMMENT='出库单明细';

-- =====================================================
-- 八、预警管理模块
-- =====================================================

-- 预警规则
CREATE TABLE alert_rule (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    rule_name VARCHAR(100) NOT NULL COMMENT '规则名称',
    rule_type VARCHAR(30) NOT NULL COMMENT 'STOCK_LOW-库存不足 STOCK_HIGH-库存超标 EXPIRY-即将过期 MSD_EXPIRE-MSD超期 STALE-呆滞料 LIFECYCLE-生命周期变更',
    target_type VARCHAR(20) DEFAULT 'ALL' COMMENT 'ALL-全部 COMPONENT-指定元件 CATEGORY-指定分类',
    target_id BIGINT COMMENT '目标ID（元件或分类）',
    threshold_value DECIMAL(12,2) COMMENT '阈值',
    threshold_unit VARCHAR(20) COMMENT '阈值单位',
    advance_days INT COMMENT '提前天数（用于有效期预警）',
    notify_method VARCHAR(30) DEFAULT 'SYSTEM' COMMENT 'SYSTEM-系统通知 EMAIL-邮件',
    notify_users VARCHAR(500) COMMENT '通知用户ID列表，逗号分隔',
    enabled TINYINT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0
) ENGINE=InnoDB COMMENT='预警规则';

-- 预警记录
CREATE TABLE alert_record (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    rule_id BIGINT COMMENT '规则ID',
    alert_type VARCHAR(30) NOT NULL COMMENT '预警类型',
    alert_level VARCHAR(10) DEFAULT 'WARNING' COMMENT 'INFO/WARNING/CRITICAL',
    component_id BIGINT COMMENT '元件ID',
    component_name VARCHAR(200),
    warehouse_id BIGINT,
    title VARCHAR(255) NOT NULL COMMENT '预警标题',
    content TEXT COMMENT '预警内容',
    status VARCHAR(20) DEFAULT 'PENDING' COMMENT 'PENDING-待处理 PROCESSING-处理中 RESOLVED-已解决 IGNORED-已忽略',
    handled_by BIGINT COMMENT '处理人',
    handle_time DATETIME,
    handle_remark VARCHAR(500),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_type_status (alert_type, status),
    INDEX idx_component (component_id),
    INDEX idx_created (created_at)
) ENGINE=InnoDB COMMENT='预警记录';

-- =====================================================
-- 九、初始化数据
-- =====================================================

-- 管理员用户（密码: admin123）
INSERT INTO sys_user (username, password, real_name, status) VALUES
('admin', '$2a$10$a6vhfdtwP/TpbqCjEs/buOyTuhADik5iiZPpMNmG6UxDg17Io/eZa', '系统管理员', 1);

-- 基础角色
INSERT INTO sys_role (role_code, role_name, description) VALUES
('ADMIN', '系统管理员', '拥有全部权限'),
('WAREHOUSE_MANAGER', '仓库管理员', '管理仓库日常操作'),
('PROCUREMENT', '采购员', '管理采购订单'),
('QC', '质检员', '管理入库质检'),
('PRODUCTION', '生产人员', '领料出库操作'),
('VIEWER', '只读用户', '查看数据和报表');

-- 管理员角色分配
INSERT INTO sys_user_role (user_id, role_id) VALUES (1, 1);

-- 基础元件分类
INSERT INTO comp_category (category_code, category_name, description) VALUES
('RES', '电阻', '包括贴片电阻、插件电阻、排阻等'),
('CAP', '电容', '包括贴片电容、电解电容、钽电容等'),
('IC', '集成电路', '包括MCU、存储器、放大器等'),
('DIODE', '二极管', '包括整流、稳压、肖特基等'),
('TRANSISTOR', '晶体管', '包括MOSFET、BJT等'),
('INDUCTOR', '电感', '包括贴片电感、功率电感等'),
('CONNECTOR', '连接器', '包括板对板、线对板等'),
('CRYSTAL', '晶振', '包括石英晶体、陶瓷晶振等'),
('LED', 'LED', '包括发光二极管、数码管等'),
('SENSOR', '传感器', '包括温度、湿度、压力传感器等'),
('PCB', 'PCB板', '印制电路板'),
('OTHER', '其他', '其他电子元件');

-- 示例仓库
INSERT INTO warehouse (warehouse_code, warehouse_name, warehouse_type, address, esd_protected) VALUES
('WH-MAIN', '主仓库', 'NORMAL', 'A栋1楼', 1),
('WH-DRY', '干燥柜仓库', 'DRY', 'A栋1楼防潮柜', 1),
('WH-RAW', '原材料仓', 'NORMAL', 'B栋1楼', 0);
