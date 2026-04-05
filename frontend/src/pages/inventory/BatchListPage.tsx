import React, { useState, useEffect, useCallback } from 'react';
import {
  Table, Card, Select, Row, Col, Button, Tag, Space, Input, Typography, Tooltip,
} from 'antd';
import {
  SearchOutlined, ReloadOutlined, WarningOutlined,
} from '@ant-design/icons';
import { getBatchList } from '../../api';
import type { Batch } from '../../types';
import dayjs from 'dayjs';

const { Title } = Typography;

const msdLevelColors: Record<string, string> = {
  '1': 'green',
  '2': 'green',
  '2a': 'blue',
  '3': 'blue',
  '4': 'orange',
  '5': 'orange',
  '5a': 'red',
  '6': 'red',
};

const batchStatusMap: Record<string, { label: string; color: string }> = {
  NORMAL: { label: '正常', color: 'green' },
  EXPIRING: { label: '即将过期', color: 'orange' },
  EXPIRED: { label: '已过期', color: 'red' },
  MSD_WARNING: { label: 'MSD预警', color: 'orange' },
  MSD_EXPIRED: { label: 'MSD超限', color: 'red' },
  LOCKED: { label: '已锁定', color: 'blue' },
};

const BatchListPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Batch[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [filters, setFilters] = useState({
    keyword: '',
    msdLevel: undefined as string | undefined,
    expiryStatus: undefined as string | undefined,
  });

  useEffect(() => {
    fetchData();
  }, [page, size]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getBatchList({ page, size, ...filters });
      const result = res.data.data;
      setData(result.list || []);
      setTotal(result.total || 0);
    } catch {
      const mockData: Batch[] = Array.from({ length: 10 }, (_, i) => {
        const msdLevel = i < 3 ? '3' : i < 6 ? '2a' : '1';
        const expiryDate = dayjs().add(i * 30 - 60, 'day').format('YYYY-MM-DD');
        const isExpiring = dayjs(expiryDate).isBefore(dayjs().add(30, 'day'));
        const isExpired = dayjs(expiryDate).isBefore(dayjs());
        return {
          id: i + 1,
          componentId: i + 1,
          internalPartNo: `R-0402-${(10 + i)}K`,
          componentName: `电阻 ${(10 + i)}K 0402`,
          batchNo: `B202601${String(i).padStart(2, '0')}`,
          supplierBatchNo: `SUP-B${1000 + i}`,
          supplierName: ['YAGEO', 'MURATA', 'SAMSUNG', 'TDK', 'VISHAY', 'PANASONIC', 'KEMET', 'AVX', 'NICHICON', 'TAIYO'][i],
          productionDate: dayjs().subtract(90 + i * 10, 'day').format('YYYY-MM-DD'),
          expiryDate,
          shelfLifeDays: 365,
          msdLevel,
          exposureDuration: i < 3 ? 150 + i * 20 : undefined,
          remainingMsdLife: i < 3 ? 168 - (150 + i * 20) : undefined,
          totalQty: 10000 - i * 500,
          availableQty: 8000 - i * 400,
          lockedQty: 2000 - i * 100,
          status: isExpired ? 'EXPIRED' : isExpiring ? 'EXPIRING' : i < 3 ? 'MSD_WARNING' : 'NORMAL',
          createTime: dayjs().subtract(90 + i * 10, 'day').format('YYYY-MM-DD HH:mm:ss'),
        };
      });
      setData(mockData);
      setTotal(56);
    } finally {
      setLoading(false);
    }
  }, [page, size, filters]);

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
      title: '供应商批次',
      dataIndex: 'supplierBatchNo',
      key: 'supplierBatchNo',
      width: 130,
    },
    {
      title: '供应商',
      dataIndex: 'supplierName',
      key: 'supplierName',
      width: 100,
    },
    {
      title: '生产日期',
      dataIndex: 'productionDate',
      key: 'productionDate',
      width: 110,
      render: (d: string) => d ? dayjs(d).format('YYYY-MM-DD') : '-',
    },
    {
      title: '有效期至',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      width: 110,
      render: (d: string) => {
        if (!d) return '-';
        const isExpired = dayjs(d).isBefore(dayjs());
        const isExpiring = dayjs(d).isBefore(dayjs().add(30, 'day'));
        return (
          <span style={{ color: isExpired ? '#ff4d4f' : isExpiring ? '#faad14' : undefined }}>
            {dayjs(d).format('YYYY-MM-DD')}
            {isExpired && <WarningOutlined style={{ marginLeft: 4, color: '#ff4d4f' }} />}
            {!isExpired && isExpiring && <WarningOutlined style={{ marginLeft: 4, color: '#faad14' }} />}
          </span>
        );
      },
    },
    {
      title: 'MSD等级',
      dataIndex: 'msdLevel',
      key: 'msdLevel',
      width: 90,
      render: (level: string) => level ? (
        <Tag color={msdLevelColors[level] || 'default'}>MSD {level}</Tag>
      ) : '-',
    },
    {
      title: '已暴露(h)',
      dataIndex: 'exposureDuration',
      key: 'exposureDuration',
      width: 100,
      render: (d: number, record: Batch) => {
        if (!d) return '-';
        const isOver = record.remainingMsdLife !== undefined && record.remainingMsdLife <= 0;
        return <span style={{ color: isOver ? '#ff4d4f' : undefined }}>{d}</span>;
      },
    },
    {
      title: 'MSD剩余(h)',
      dataIndex: 'remainingMsdLife',
      key: 'remainingMsdLife',
      width: 110,
      render: (val: number) => {
        if (val === undefined) return '-';
        return <span style={{ color: val <= 0 ? '#ff4d4f' : val < 24 ? '#faad14' : undefined }}>{val}</span>;
      },
    },
    {
      title: '总数量',
      dataIndex: 'totalQty',
      key: 'totalQty',
      width: 90,
    },
    {
      title: '可用数量',
      dataIndex: 'availableQty',
      key: 'availableQty',
      width: 90,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const info = batchStatusMap[status];
        return info ? <Tag color={info.color}>{info.label}</Tag> : status;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      fixed: 'right' as const,
      render: () => <Button type="link" size="small">详情</Button>,
    },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>批次管理</Title>

      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="搜索料号/批次号"
              prefix={<SearchOutlined />}
              value={filters.keyword}
              onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
              onPressEnter={handleSearch}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="MSD等级"
              allowClear
              style={{ width: '100%' }}
              value={filters.msdLevel}
              onChange={(val) => setFilters({ ...filters, msdLevel: val })}
              options={['1', '2', '2a', '3', '4', '5', '5a', '6'].map((v) => ({ value: v, label: `MSD ${v}` }))}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="过期状态"
              allowClear
              style={{ width: '100%' }}
              value={filters.expiryStatus}
              onChange={(val) => setFilters({ ...filters, expiryStatus: val })}
              options={[
                { value: 'NORMAL', label: '正常' },
                { value: 'EXPIRING', label: '即将过期' },
                { value: 'EXPIRED', label: '已过期' },
              ]}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>搜索</Button>
              <Button onClick={() => setFilters({ keyword: '', msdLevel: undefined, expiryStatus: undefined })}>重置</Button>
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
          scroll={{ x: 1600 }}
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

export default BatchListPage;
