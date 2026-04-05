import React, { useState, useEffect, useCallback } from 'react';
import {
  Table, Card, Select, Row, Col, Button, Tag, Space, Input, message, Typography, Modal,
} from 'antd';
import {
  SearchOutlined, ReloadOutlined, LockOutlined, UnlockOutlined,
} from '@ant-design/icons';
import { getStockLocks, unlockStock } from '../../api';
import type { StockLock } from '../../types';
import dayjs from 'dayjs';

const { Title } = Typography;

const lockTypeMap: Record<string, string> = {
  OUTBOUND: '出库锁定',
  PURCHASE: '采购预留',
  PRODUCTION: '生产预留',
  QC: '质检锁定',
  INVENTORY: '盘点锁定',
  OTHER: '其他',
};

const lockStatusMap: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: '已锁定', color: 'red' },
  RELEASED: { label: '已释放', color: 'green' },
  EXPIRED: { label: '已过期', color: 'default' },
};

const StockLockPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<StockLock[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [filters, setFilters] = useState({
    keyword: '',
    lockType: undefined as string | undefined,
    status: undefined as string | undefined,
  });

  useEffect(() => {
    fetchData();
  }, [page, size]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getStockLocks({ page, size, ...filters });
      const result = res.data.data;
      setData(result.list || []);
      setTotal(result.total || 0);
    } catch {
      const mockData: StockLock[] = Array.from({ length: 8 }, (_, i) => ({
        id: i + 1,
        stockId: i + 1,
        internalPartNo: `R-0402-${(10 + i)}K`,
        componentName: `电阻 ${(10 + i)}K 0402`,
        batchNo: `B202601${String(i).padStart(2, '0')}`,
        warehouseName: '主仓库',
        locationName: `A-${String(i + 1).padStart(2, '0')}-01`,
        lockQty: 100 + i * 50,
        lockType: ['OUTBOUND', 'PURCHASE', 'PRODUCTION', 'QC', 'INVENTORY', 'OTHER', 'OUTBOUND', 'PURCHASE'][i],
        reason: ['订单出库预留', '采购到货预留', '生产工单预留', 'IQC检验中', '库存盘点', '其他原因', '订单出库预留', '采购到货预留'][i],
        lockBy: ['张三', '李四', '王五', '赵六', '张三', '李四', '王五', '赵六'][i],
        lockTime: dayjs().subtract(i * 2, 'hour').format('YYYY-MM-DD HH:mm:ss'),
        expectedUnlockTime: dayjs().add(24 - i * 2, 'hour').format('YYYY-MM-DD HH:mm:ss'),
        status: i < 5 ? 'ACTIVE' : i < 7 ? 'RELEASED' : 'EXPIRED',
        unlockBy: i >= 5 && i < 7 ? '管理员' : undefined,
        unlockTime: i >= 5 && i < 7 ? dayjs().subtract(i, 'hour').format('YYYY-MM-DD HH:mm:ss') : undefined,
      }));
      setData(mockData);
      setTotal(8);
    } finally {
      setLoading(false);
    }
  }, [page, size, filters]);

  const handleUnlock = async (record: StockLock) => {
    Modal.confirm({
      title: '确认解锁',
      content: `确定要释放 ${record.internalPartNo} 的 ${record.lockQty} 个库存锁定吗？`,
      onOk: async () => {
        try {
          await unlockStock(record.id);
          message.success('解锁成功');
          fetchData();
        } catch (err: unknown) {
          message.error(err instanceof Error ? err.message : '解锁失败');
        }
      },
    });
  };

  const handleSearch = () => {
    setPage(1);
    fetchData();
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
      title: '元件名称',
      dataIndex: 'componentName',
      key: 'componentName',
      width: 140,
    },
    {
      title: '批次号',
      dataIndex: 'batchNo',
      key: 'batchNo',
      width: 130,
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
      title: '锁定数量',
      dataIndex: 'lockQty',
      key: 'lockQty',
      width: 100,
    },
    {
      title: '锁定类型',
      dataIndex: 'lockType',
      key: 'lockType',
      width: 110,
      render: (type: string) => lockTypeMap[type] || type,
    },
    {
      title: '原因',
      dataIndex: 'reason',
      key: 'reason',
      width: 130,
    },
    {
      title: '锁定人',
      dataIndex: 'lockBy',
      key: 'lockBy',
      width: 80,
    },
    {
      title: '锁定时间',
      dataIndex: 'lockTime',
      key: 'lockTime',
      width: 170,
      render: (t: string) => t ? dayjs(t).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: '预计解锁',
      dataIndex: 'expectedUnlockTime',
      key: 'expectedUnlockTime',
      width: 170,
      render: (t: string) => t ? dayjs(t).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) => {
        const info = lockStatusMap[status];
        return info ? <Tag color={info.color}>{info.label}</Tag> : status;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      fixed: 'right' as const,
      render: (_: unknown, record: StockLock) => (
        record.status === 'ACTIVE' ? (
          <Button
            type="link"
            size="small"
            icon={<UnlockOutlined />}
            onClick={() => handleUnlock(record)}
          >
            解锁
          </Button>
        ) : '-'
      ),
    },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>库存锁定</Title>

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
              placeholder="锁定类型"
              allowClear
              style={{ width: '100%' }}
              value={filters.lockType}
              onChange={(val) => setFilters({ ...filters, lockType: val })}
              options={Object.entries(lockTypeMap).map(([k, v]) => ({ value: k, label: v }))}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="锁定状态"
              allowClear
              style={{ width: '100%' }}
              value={filters.status}
              onChange={(val) => setFilters({ ...filters, status: val })}
              options={Object.entries(lockStatusMap).map(([k, v]) => ({ value: k, label: v.label }))}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>搜索</Button>
              <Button onClick={() => setFilters({ keyword: '', lockType: undefined, status: undefined })}>重置</Button>
              <Button icon={<ReloadOutlined />} onClick={() => fetchData()}>刷新</Button>
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
          scroll={{ x: 1540 }}
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

export default StockLockPage;
