import request from './request';
import type {
  Result,
  PageResult,
  LoginRequest,
  LoginResponse,
  User,
  Component,
  Category,
  Parameter,
  Substitute,
  Warehouse,
  StorageLocation,
  Stock,
  Batch,
  StockLock,
  PurchaseOrder,
  InboundOrder,
  IqcRecord,
  OutboundOrder,
  Bom,
  Supplier,
  AlertRecord,
  AlertRule,
  DashboardData,
  TurnoverReport,
  StaleReport,
  AlertStats,
  OperationLog,
} from '../types';

// ============ 认证 ============

export const login = (data: LoginRequest) =>
  request.post<Result<LoginResponse>>('/auth/login', data);

export const getUserInfo = () =>
  request.get<Result<User>>('/auth/user-info');

// ============ 元件 ============

export const getComponentList = (params: Record<string, unknown>) =>
  request.get<Result<PageResult<Component>>>('/components', { params });

export const getComponent = (id: number) =>
  request.get<Result<Component>>(`/components/${id}`);

export const createComponent = (data: Partial<Component>) =>
  request.post<Result<Component>>('/components', data);

export const updateComponent = (id: number, data: Partial<Component>) =>
  request.put<Result<Component>>(`/components/${id}`, data);

export const deleteComponent = (id: number) =>
  request.delete<Result<void>>(`/components/${id}`);

// ============ 分类 ============

export const getCategoryTree = () =>
  request.get<Result<Category[]>>('/components/categories/tree');

export const createCategory = (data: Partial<Category>) =>
  request.post<Result<Category>>('/components/categories', data);

export const updateCategory = (id: number, data: Partial<Category>) =>
  request.put<Result<Category>>(`/components/categories/${id}`, data);

export const deleteCategory = (id: number) =>
  request.delete<Result<void>>(`/components/categories/${id}`);

// ============ 库存 ============

export const getStockList = (params: Record<string, unknown>) =>
  request.get<Result<PageResult<Stock>>>('/inventory/stocks', { params });

export const getBatchList = (params: Record<string, unknown>) =>
  request.get<Result<PageResult<Batch>>>('/inventory/batches', { params });

export const getWarehouses = () =>
  request.get<Result<Warehouse[]>>('/inventory/warehouses');

export const getWarehouseDetail = (id: number) =>
  request.get<Result<Warehouse>>(`/inventory/warehouses/${id}`);

export const createWarehouse = (data: Partial<Warehouse>) =>
  request.post<Result<Warehouse>>('/inventory/warehouses', data);

export const updateWarehouse = (id: number, data: Partial<Warehouse>) =>
  request.put<Result<Warehouse>>(`/inventory/warehouses/${id}`, data);

export const getStorageLocations = (warehouseId: number) =>
  request.get<Result<StorageLocation[]>>(`/inventory/warehouses/${warehouseId}/locations`);

export const getStockLocks = (params: Record<string, unknown>) =>
  request.get<Result<PageResult<StockLock>>>('/inventory/locks', { params });

export const lockStock = (data: Partial<StockLock>) =>
  request.post<Result<StockLock>>('/inventory/locks', data);

export const unlockStock = (id: number) =>
  request.put<Result<void>>(`/inventory/locks/${id}/unlock`);

// ============ 入库 ============

export const getPurchaseOrders = (params: Record<string, unknown>) =>
  request.get<Result<PageResult<PurchaseOrder>>>('/inbound/purchase-orders', { params });

export const getPurchaseOrder = (id: number) =>
  request.get<Result<PurchaseOrder>>(`/inbound/purchase-orders/${id}`);

export const createPurchaseOrder = (data: Partial<PurchaseOrder>) =>
  request.post<Result<PurchaseOrder>>('/inbound/purchase-orders', data);

export const updatePurchaseOrder = (id: number, data: Partial<PurchaseOrder>) =>
  request.put<Result<PurchaseOrder>>(`/inbound/purchase-orders/${id}`, data);

export const submitPurchaseOrder = (id: number) =>
  request.put<Result<void>>(`/inbound/purchase-orders/${id}/submit`);

export const confirmPurchaseOrder = (id: number) =>
  request.put<Result<void>>(`/inbound/purchase-orders/${id}/confirm`);

export const getInboundOrders = (params: Record<string, unknown>) =>
  request.get<Result<PageResult<InboundOrder>>>('/inbound/orders', { params });

export const createInboundOrder = (data: Partial<InboundOrder>) =>
  request.post<Result<InboundOrder>>('/inbound/orders', data);

export const getIqcRecords = (params: Record<string, unknown>) =>
  request.get<Result<PageResult<IqcRecord>>>('/inbound/iqc', { params });

export const submitIqc = (data: Partial<IqcRecord>) =>
  request.post<Result<IqcRecord>>('/inbound/iqc', data);

export const getSuppliers = (params?: Record<string, unknown>) =>
  request.get<Result<PageResult<Supplier>>>('/inbound/suppliers', { params });

export const createSupplier = (data: Partial<Supplier>) =>
  request.post<Result<Supplier>>('/inbound/suppliers', data);

export const updateSupplier = (id: number, data: Partial<Supplier>) =>
  request.put<Result<Supplier>>(`/inbound/suppliers/${id}`, data);

export const deleteSupplier = (id: number) =>
  request.delete<Result<void>>(`/inbound/suppliers/${id}`);

// ============ 出库 ============

export const getOutboundOrders = (params: Record<string, unknown>) =>
  request.get<Result<PageResult<OutboundOrder>>>('/outbound/orders', { params });

export const getOutboundOrder = (id: number) =>
  request.get<Result<OutboundOrder>>(`/outbound/orders/${id}`);

export const createOutboundOrder = (data: Partial<OutboundOrder>) =>
  request.post<Result<OutboundOrder>>('/outbound/orders', data);

export const approveOutboundOrder = (id: number) =>
  request.put<Result<void>>(`/outbound/orders/${id}/approve`);

export const getBomList = (params?: Record<string, unknown>) =>
  request.get<Result<PageResult<Bom>>>('/outbound/boms', { params });

export const getBom = (id: number) =>
  request.get<Result<Bom>>(`/outbound/boms/${id}`);

export const createBom = (data: Partial<Bom>) =>
  request.post<Result<Bom>>('/outbound/boms', data);

export const updateBom = (id: number, data: Partial<Bom>) =>
  request.put<Result<Bom>>(`/outbound/boms/${id}`, data);

export const deleteBom = (id: number) =>
  request.delete<Result<void>>(`/outbound/boms/${id}`);

// ============ 报表 ============

export const getDashboardData = () =>
  request.get<Result<DashboardData>>('/reports/dashboard');

export const getTurnoverReport = (params: Record<string, unknown>) =>
  request.get<Result<PageResult<TurnoverReport>>>('/reports/turnover', { params });

export const getStaleReport = (params: Record<string, unknown>) =>
  request.get<Result<PageResult<StaleReport>>>('/reports/stale', { params });

export const getAlertStats = () =>
  request.get<Result<AlertStats>>('/reports/alert-stats');

export const getOperationLogs = (params: Record<string, unknown>) =>
  request.get<Result<PageResult<OperationLog>>>('/reports/operation-logs', { params });

// ============ 预警 ============

export const getAlerts = (params: Record<string, unknown>) =>
  request.get<Result<PageResult<AlertRecord>>>('/alerts', { params });

export const handleAlert = (id: number, data: { handleNotes: string }) =>
  request.put<Result<void>>(`/alerts/${id}/handle`, data);

export const ignoreAlert = (id: number) =>
  request.put<Result<void>>(`/alerts/${id}/ignore`);

export const getAlertRules = () =>
  request.get<Result<AlertRule[]>>('/alerts/rules');

export const createAlertRule = (data: Partial<AlertRule>) =>
  request.post<Result<AlertRule>>('/alerts/rules', data);

export const updateAlertRule = (id: number, data: Partial<AlertRule>) =>
  request.put<Result<AlertRule>>(`/alerts/rules/${id}`, data);

// ============ 系统管理 ============

export const getUsers = (params?: Record<string, unknown>) =>
  request.get<Result<PageResult<User>>>('/system/users', { params });

export const createUser = (data: Partial<User>) =>
  request.post<Result<User>>('/system/users', data);

export const updateUser = (id: number, data: Partial<User>) =>
  request.put<Result<User>>(`/system/users/${id}`, data);

export const deleteUser = (id: number) =>
  request.delete<Result<void>>(`/system/users/${id}`);

export const toggleUserStatus = (id: number, enabled: boolean) =>
  request.put<Result<void>>(`/system/users/${id}/status`, { enabled });
