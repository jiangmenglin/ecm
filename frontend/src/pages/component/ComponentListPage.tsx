import React, { useState, useEffect, useCallback } from 'react';
import {
  Table, Button, Input, Select, Space, Tag, Row, Col, Card, message, Popconfirm, Typography,
} from 'antd';
import {
  PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, EyeOutlined, ReloadOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getComponentList, deleteComponent, getCategoryTree } from '../../api';
import type { Component, Category } from '../../types';

const { Title } = Typography;

const lifecycleStatusMap: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: '活跃', color: 'green' },
  NRND: { label: '不推荐新设计', color: 'orange' },
  EOL: { label: '即将停产', color: 'red' },
  OBSOLETE: { label: '已停产', color: 'default' },
};

const stockStatusMap: Record<string, { label: string; color: string }> = {
  NORMAL: { label: '正常', color: 'green' },
  LOW: { label: '偏低', color: 'orange' },
  OUT_OF_STOCK: { label: '缺货', color: 'red' },
  OVERSTOCK: { label: '积压', color: 'blue' },
};

const ComponentListPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Component[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState({
    keyword: '',
    categoryId: undefined as number | undefined,
    lifecycleStatus: undefined as string | undefined,
    packageType: undefined as string | undefined,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchData();
  }, [page, size]);

  const fetchCategories = async () => {
    try {
      const res = await getCategoryTree();
      setCategories(res.data.data || []);
    } catch {
      // ignore
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getComponentList({
        page,
        size,
        ...filters,
      });
      const result = res.data.data;
      setData(result.list || []);
      setTotal(result.total || 0);
    } catch {
      // 使用模拟数据
      const mockData: Component[] = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        internalPartNo: `R-0402-${1000 + i}K`,
        manufacturerPartNo: `RC0402FR-07${1000 + i}KL`,
        name: `电阻 ${(10 + i)}K 0402`,
        categoryId: 1,
        categoryName: '电阻',
        manufacturer: 'YAGEO',
        packageType: '0402',
        lifecycleStatus: 'ACTIVE',
        createTime: '2026-01-15 10:30:00',
        updateTime: '2026-03-20 14:22:00',
        stockSummary: {
          totalQty: 5000 + i * 100,
          availableQty: 4000 + i * 80,
          lockedQty: 1000 + i * 20,
          stockStatus: i === 3 ? 'LOW' : i === 5 ? 'OUT_OF_STOCK' : 'NORMAL',
        },
      }));
      setData(mockData);
      setTotal(85);
    } finally {
      setLoading(false);
    }
  }, [page, size, filters]);

  const handleSearch = () => {
    setPage(1);
    fetchData();
  };

  const handleReset = () => {
    setFilters({
      keyword: '',
      categoryId: undefined,
      lifecycleStatus: undefined,
      packageType: undefined,
    });
    setPage(1);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteComponent(id);
      message.success('删除成功');
      fetchData();
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : '删除失败');
    }
  };

  const flattenCategories = (cats: Category[], result: { label: string; value: number }[] = []) => {
    cats.forEach((cat) => {
      result.push({ label: cat.name, value: cat.id });
      if (cat.children) {
        flattenCategories(cat.children, result);
      }
    });
    return result;
  };

  const columns = [
    {
      title: '内部料号',
      dataIndex: 'internalPartNo',
      key: 'internalPartNo',
      width: 150,
      fixed: 'left' as const,
      render: (text: string, record: Component) => (
        <a onClick={() => navigate(`/components/${record.id}`)}>{text}</a>
      ),
    },
    {
      title: '制造商料号',
      dataIndex: 'manufacturerPartNo',
      key: 'manufacturerPartNo',
      width: 180,
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: '分类',
      dataIndex: 'categoryName',
      key: 'categoryName',
      width: 100,
    },
    {
      title: '封装',
      dataIndex: 'packageType',
      key: 'packageType',
      width: 80,
    },
    {
      title: '制造商',
      dataIndex: 'manufacturer',
      key: 'manufacturer',
      width: 120,
    },
    {
      title: '生命周期',
      dataIndex: 'lifecycleStatus',
      key: 'lifecycleStatus',
      width: 120,
      render: (status: string) => {
        const info = lifecycleStatusMap[status];
        return info ? <Tag color={info.color}>{info.label}</Tag> : status;
      },
    },
    {
      title: '库存状态',
      key: 'stockStatus',
      width: 100,
      render: (_: unknown, record: Component) => {
        const status = record.stockSummary?.stockStatus;
        if (!status) return '-';
        const info = stockStatusMap[status];
        return info ? <Tag color={info.color}>{info.label}</Tag> : status;
      },
    },
    {
      title: '库存数量',
      key: 'totalQty',
      width: 100,
      render: (_: unknown, record: Component) => record.stockSummary?.totalQty ?? '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right' as const,
      render: (_: unknown, record: Component) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/components/${record.id}`)}
          >
            详情
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(`/components/${record.id}/edit`)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除此元件吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>元件列表</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/components/add')}
        >
          新增元件
        </Button>
      </div>

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
              placeholder="选择分类"
              allowClear
              style={{ width: '100%' }}
              value={filters.categoryId}
              onChange={(val) => setFilters({ ...filters, categoryId: val })}
              options={flattenCategories(categories)}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="生命周期状态"
              allowClear
              style={{ width: '100%' }}
              value={filters.lifecycleStatus}
              onChange={(val) => setFilters({ ...filters, lifecycleStatus: val })}
              options={Object.entries(lifecycleStatusMap).map(([k, v]) => ({ value: k, label: v.label }))}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                搜索
              </Button>
              <Button onClick={handleReset}>重置</Button>
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
          scroll={{ x: 1280 }}
          pagination={{
            current: page,
            pageSize: size,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (t) => `共 ${t} 条`,
            onChange: (p, s) => {
              setPage(p);
              setSize(s);
            },
          }}
        />
      </Card>
    </div>
  );
};

export default ComponentListPage;
