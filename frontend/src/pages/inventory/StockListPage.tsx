import React, { useState, useEffect, useCallback } from 'react';
import {
  Table, Card, Select, Row, Col, Button, Tag, Space, Input, message, Typography,
} from 'antd';
import {
  SearchOutlined, ReloadOutlined, ExportOutlined, LockOutlined,
} from '@ant-design/icons';
import { getStockList, getWarehouses } from '../../api';
import type { Stock, Warehouse } from '../../types';

const { Title } = Typography;

const stockStatusMap: Record<string, { label: string; color: string }> = {
  NORMAL: { label: '正常', color: 'green' },
  LOW: { label: '偏低', color: 'orange' },
  OUT_OF_STOCK: { label: '缺货', color: 'red' },
  OVERSTOCK: { label: '积压', color: 'blue' },
};

const StockListPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Stock[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [filters, setFilters] = useState({
    keyword: '',
    warehouseId: undefined as number | undefined,
    stockStatus: undefined as string | undefined,
  });

  useEffect(() => {
    fetchWarehouses();
  }, []);

  useEffect(() => {
    fetchData();
  }, [page, size]);

  const fetchWarehouses = async () => {
    try {
      const res = await getWarehouses();
      setWarehouses(res.data.data || []);
    } catch {
      setWarehouses([
        { id: 1, name: '主仓库', code: 'WH01', type: 'RAW', enabled: true },
        { id: 2, name: '成品仓', code: 'WH02', type: 'FINISHED', enabled: true },
        { id: 3, name: '不良品仓', code: 'WH03', type: 'DEFECT', enabled: true },
      ]);
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getStockList({ page, size, ...filters });
      const result = res.data.data;
      setData(result.list || []);
      setTotal(result.total || 0);
    } catch {
      const mockData: Stock[] = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        componentId: i + 1,
        internalPartNo: `R-0402-${(10 + i)}K`,
        componentName: `电阻 ${(10 + i)}K 0402`,
        packageType: '0402',
        warehouseId: 1,
        warehouseName: '主仓库',
        locationId: i + 1,
        locationName: `A-${String(i + 1).padStart(2, '0')}-01`,
        batchId: i + 100,
        batchNo: `B202601${String(i).padStart(2, '0')}`,
        qty: 5000 - i * 300,
        lockedQty: i * 100,
        availableQty: 5000 - i * 400,
        safetyStock: 2000,
        stockStatus: i < 2 ? 'LOW' : i === 2 ? 'OUT_OF_STOCK' : 'NORMAL',
      }));
      setData(mockData);
      setTotal(120);
    } finally {
      setLoading(false);
    }
  }, [page, size, filters]);

  const handleSearch = () => {
    setPage(1);
    fetchData();
  };

  const handleExport = () => {
    message.info('导出功能开发中...');
  };

  const columns = [
    {
      title: '料号',
      dataIndex: 'internalPartNo',
      key: 'internalPartNo',
      width: 140,
      fixed: 'left' as const,
    },
    {
      title: '名称',
      dataIndex: 'componentName',
      key: 'componentName',
      width: 140,
    },
    {
      title: '封装',
      dataIndex: 'packageType',
      key: 'packageType',
      width: 80,
    },
    {
      title: '仓库',
      dataIndex: 'warehouseName',
      key: 'warehouseName',
      width: 100,
    },
    {
      title: '库位',
      dataIndex: 'locationName',
      key: 'locationName',
      width: 100,
    },
    {
      title: '批次号',
      dataIndex: 'batchNo',
      key: 'batchNo',
      width: 130,
    },
    {
      title: '在库数量',
      dataIndex: 'qty',
      key: 'qty',
      width: 100,
      sorter: true,
    },
    {
      title: '预留数量',
      dataIndex: 'lockedQty',
      key: 'lockedQty',
      width: 100,
    },
    {
      title: '可用数量',
      dataIndex: 'availableQty',
      key: 'availableQty',
      width: 100,
      render: (qty: number, record: Stock) => {
        const color = qty === 0 ? '#ff4d4f' : qty < (record.safetyStock || 0) ? '#faad14' : undefined;
        return <span style={{ color, fontWeight: qty === 0 ? 'bold' : 'normal' }}>{qty}</span>;
      },
    },
    {
      title: '安全库存',
      dataIndex: 'safetyStock',
      key: 'safetyStock',
      width: 100,
    },
    {
      title: '状态',
      dataIndex: 'stockStatus',
      key: 'stockStatus',
      width: 80,
      render: (status: string) => {
        const info = stockStatusMap[status];
        return info ? <Tag color={info.color}>{info.label}</Tag> : status;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right' as const,
      render: (_: unknown, record: Stock) => (
        <Space size="small">
          <Button type="link" size="small" icon={<LockOutlined />}>锁定</Button>
          <Button type="link" size="small">盘点</Button>
          <Button type="link" size="small">详情</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>库存查询</Title>

      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="搜索料号/名称"
              prefix={<SearchOutlined />}
              value={filters.keyword}
              onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
              onPressEnter={handleSearch}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="选择仓库"
              allowClear
              style={{ width: '100%' }}
              value={filters.warehouseId}
              onChange={(val) => setFilters({ ...filters, warehouseId: val })}
              options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="库存状态"
              allowClear
              style={{ width: '100%' }}
              value={filters.stockStatus}
              onChange={(val) => setFilters({ ...filters, stockStatus: val })}
              options={Object.entries(stockStatusMap).map(([k, v]) => ({ value: k, label: v.label }))}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>搜索</Button>
              <Button onClick={() => setFilters({ keyword: '', warehouseId: undefined, stockStatus: undefined })}>重置</Button>
              <Button icon={<ReloadOutlined />} onClick={() => fetchData()}>刷新</Button>
              <Button icon={<ExportOutlined />} onClick={handleExport}>导出</Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1420 }}
          pagination={{
            current: page,
            pageSize: size,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (t) => `共 ${t} 条`,
            onChange: (p, s) => { setPage(p); setSize(s); },
          }}
        />
      </Card>
    </div>
  );
};

export default StockListPage;
