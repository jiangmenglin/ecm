// ============ 通用类型 ============

export interface Result<T = unknown> {
  code: number;
  message: string;
  data: T;
}

export interface PageResult<T> {
  list: T[];
  total: number;
  page: number;
  size: number;
}

export interface PageRequest {
  page?: number;
  size?: number;
  [key: string]: unknown;
}

// ============ 认证 ============

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface User {
  id: number;
  username: string;
  realName: string;
  email: string;
  phone: string;
  role: string;
  enabled: boolean;
  createTime: string;
}

// ============ 元件 ============

export interface Component {
  id: number;
  internalPartNo: string;
  manufacturerPartNo: string;
  name: string;
  nameEn?: string;
  categoryId: number;
  categoryName: string;
  manufacturer?: string;
  packageType?: string;
  packageStandard?: string;
  lifecycleStatus: string;
  description?: string;
  imageUrl?: string;
  datasheetUrl?: string;
  msdLevel?: string;
  esdSensitive?: boolean;
  esdClass?: string;
  operatingTempMin?: number;
  operatingTempMax?: number;
  storageTempMin?: number;
  storageTempMax?: number;
  unit?: string;
  defaultLeadTime?: number;
  minimumOrderQty?: number;
  customFields?: Record<string, string>;
  createTime: string;
  updateTime: string;
  parameters?: Parameter[];
  substitutes?: Substitute[];
  stockSummary?: StockSummary;
}

export interface Parameter {
  id?: number;
  componentId?: number;
  name: string;
  value: string;
  unit?: string;
  description?: string;
  sortOrder?: number;
}

export interface Substitute {
  id?: number;
  componentId?: number;
  substituteComponentId: number;
  substitutePartNo: string;
  substituteName: string;
  matchLevel: string;
  notes?: string;
}

export interface StockSummary {
  totalQty: number;
  availableQty: number;
  lockedQty: number;
  safetyStock?: number;
  stockStatus: string;
}

// ============ 分类 ============

export interface Category {
  id: number;
  name: string;
  parentId: number | null;
  code: string;
  description?: string;
  sortOrder: number;
  children?: Category[];
}

// ============ 仓库 ============

export interface Warehouse {
  id: number;
  name: string;
  code: string;
  type: string;
  address?: string;
  description?: string;
  enabled: boolean;
  locations?: StorageLocation[];
}

export interface StorageLocation {
  id: number;
  warehouseId: number;
  name: string;
  code: string;
  parentId: number | null;
  type: string;
  capacity?: number;
  usedCapacity?: number;
  children?: StorageLocation[];
}

// ============ 库存 ============

export interface Stock {
  id: number;
  componentId: number;
  internalPartNo: string;
  componentName: string;
  packageType?: string;
  warehouseId: number;
  warehouseName: string;
  locationId: number;
  locationName: string;
  batchId: number;
  batchNo: string;
  qty: number;
  lockedQty: number;
  availableQty: number;
  safetyStock?: number;
  stockStatus: string;
}

export interface Batch {
  id: number;
  componentId: number;
  internalPartNo: string;
  componentName: string;
  batchNo: string;
  supplierBatchNo?: string;
  supplierId?: number;
  supplierName?: string;
  productionDate?: string;
  expiryDate?: string;
  shelfLifeDays?: number;
  msdLevel?: string;
  exposureStartTime?: string;
  exposureDuration?: number;
  remainingLife?: number;
  remainingMsdLife?: number;
  totalQty: number;
  availableQty: number;
  lockedQty: number;
  status: string;
  createTime: string;
}

export interface StockLock {
  id: number;
  stockId: number;
  internalPartNo: string;
  componentName: string;
  batchNo: string;
  warehouseName: string;
  locationName: string;
  lockQty: number;
  lockType: string;
  reason: string;
  lockBy: string;
  lockTime: string;
  expectedUnlockTime?: string;
  status: string;
  unlockBy?: string;
  unlockTime?: string;
}

// ============ 入库 ============

export interface PurchaseOrder {
  id: number;
  orderNo: string;
  supplierId: number;
  supplierName: string;
  status: string;
  totalAmount?: number;
  currency?: string;
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
  notes?: string;
  items: PurchaseOrderItem[];
  createdBy: string;
  createTime: string;
  updateTime: string;
}

export interface PurchaseOrderItem {
  id?: number;
  orderId?: number;
  componentId: number;
  internalPartNo: string;
  componentName: string;
  orderedQty: number;
  receivedQty: number;
  unitPrice?: number;
  expectedDate?: string;
  notes?: string;
}

export interface InboundOrder {
  id: number;
  orderNo: string;
  purchaseOrderId?: number;
  purchaseOrderNo?: string;
  supplierId?: number;
  supplierName?: string;
  warehouseId: number;
  warehouseName: string;
  status: string;
  totalQty: number;
  notes?: string;
  operator: string;
  items: InboundOrderItem[];
  createTime: string;
}

export interface InboundOrderItem {
  id?: number;
  inboundOrderId?: number;
  componentId: number;
  internalPartNo: string;
  componentName: string;
  batchNo: string;
  supplierBatchNo?: string;
  qty: number;
  productionDate?: string;
  expiryDate?: string;
  msdLevel?: string;
  locationId: number;
  locationName: string;
  iqcStatus?: string;
  iqcId?: number;
}

export interface IqcRecord {
  id: number;
  inboundOrderId: number;
  inboundOrderNo: string;
  componentId: number;
  internalPartNo: string;
  componentName: string;
  batchNo: string;
  supplierBatchNo?: string;
  inspectionType: string;
  sampleQty: number;
  acceptQty: number;
  rejectQty: number;
  appearanceResult: string;
  functionResult: string;
  pinOxidationResult: string;
  dimensionResult: string;
  overallResult: string;
  disposition: string;
  inspector: string;
  inspectTime: string;
  notes?: string;
}

// ============ 出库 ============

export interface OutboundOrder {
  id: number;
  orderNo: string;
  type: string;
  bomId?: number;
  bomName?: string;
  status: string;
  totalQty: number;
  recipient?: string;
  department?: string;
  project?: string;
  notes?: string;
  items: OutboundOrderItem[];
  createdBy: string;
  createTime: string;
  approveBy?: string;
  approveTime?: string;
}

export interface OutboundOrderItem {
  id?: number;
  outboundOrderId?: number;
  componentId: number;
  internalPartNo: string;
  componentName: string;
  requestedQty: number;
  allocatedQty: number;
  batchNo?: string;
  warehouseName?: string;
  locationName?: string;
}

export interface Bom {
  id: number;
  name: string;
  code: string;
  version: string;
  description?: string;
  status: string;
  items: BomItem[];
  createdBy: string;
  createTime: string;
  updateTime: string;
}

export interface BomItem {
  id?: number;
  bomId?: number;
  componentId: number;
  internalPartNo: string;
  componentName: string;
  quantity: number;
  unit: string;
  referenceDesignator?: string;
  substituteAllowed: boolean;
  notes?: string;
}

// ============ 供应商 ============

export interface Supplier {
  id: number;
  code: string;
  name: string;
  shortName?: string;
  contact?: string;
  phone?: string;
  email?: string;
  address?: string;
  qualification?: string;
  qualificationExpiry?: string;
  rating: number;
  leadTime?: number;
  paymentTerms?: string;
  enabled: boolean;
  createTime: string;
}

// ============ 预警 ============

export interface AlertRecord {
  id: number;
  type: string;
  level: string;
  componentId?: number;
  internalPartNo?: string;
  componentName?: string;
  title: string;
  message: string;
  status: string;
  triggerValue?: string;
  thresholdValue?: string;
  handledBy?: string;
  handleTime?: string;
  handleNotes?: string;
  createTime: string;
}

export interface AlertRule {
  id: number;
  name: string;
  type: string;
  description?: string;
  condition: string;
  threshold: number;
  unit?: string;
  enabled: boolean;
  notifyRoles: string[];
  createTime: string;
  updateTime: string;
}

// ============ 报表 ============

export interface DashboardData {
  totalComponents: number;
  totalStock: number;
  pendingAlerts: number;
  todayInbound: number;
  lowStockCount: number;
  expiringCount: number;
  recentAlerts: AlertRecord[];
  lowStockWarnings: StockWarning[];
}

export interface StockWarning {
  componentId: number;
  internalPartNo: string;
  componentName: string;
  currentQty: number;
  safetyStock: number;
  shortageQty: number;
}

export interface TurnoverReport {
  componentId: number;
  internalPartNo: string;
  componentName: string;
  categoryName: string;
  totalInbound: number;
  totalOutbound: number;
  averageStock: number;
  turnoverRate: number;
  turnoverDays: number;
}

export interface StaleReport {
  componentId: number;
  internalPartNo: string;
  componentName: string;
  categoryName: string;
  currentQty: number;
  lastOutboundDate?: string;
  staleDays: number;
  staleValue?: number;
}

export interface AlertStats {
  totalAlerts: number;
  pendingAlerts: number;
  handledAlerts: number;
  ignoredAlerts: number;
  alertsByType: { type: string; count: number }[];
  alertsByLevel: { level: string; count: number }[];
  alertsByDay: { date: string; count: number }[];
}

export interface OperationLog {
  id: number;
  module: string;
  operation: string;
  operator: string;
  target: string;
  detail?: string;
  ip?: string;
  createTime: string;
}
