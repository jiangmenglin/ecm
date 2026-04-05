import React, { useState, useEffect, useCallback } from 'react';
import {
  Table, Card, Select, Row, Col, Button, Tag, Space, Input, Typography, Modal, Form, message,
} from 'antd';
import {
  SearchOutlined, PlusOutlined, ReloadOutlined,
} from '@ant-design/icons';
import { getInboundOrders, createInboundOrder } from '../../api';
import type { InboundOrder } from '../../types';
import dayjs from 'dayjs';

const { Title } = Typography;

const inboundStatusMap: Record<string, { label: string; color: string }> = {
  PENDING: { label: '待入库', color: 'default' },
  RECEIVING: { label: '入库中', color: 'blue' },
  IQC_PENDING: { label: '待检验', color: 'orange' },
  IQC_PASS: { label: '检验通过', color: 'green' },
  IQC_FAIL: { label: '检验不合格', color: 'red' },
  COMPLETED: { label: '已完成', color: 'green' },
  CANCELLED: { label: '已取消', color: 'default' },
};

const InboundOrderPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<InboundOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, [page, size]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getInboundOrders({ page, size, status: statusFilter });
      const result = res.data.data;
      setData(result.list || []);
      setTotal(result.total || 0);
    } catch {
      const mockData: InboundOrder[] = Array.from({ length: 8 }, (_, i) => ({
        id: i + 1,
        orderNo: `IN202604${String(i + 1).padStart(3, '0')}`,
        purchaseOrderId: i + 1,
        purchaseOrderNo: `PO202604${String(i + 1).padStart(3, '0')}`,
        supplierId: i + 1,
        supplierName: ['YAGEO', 'MURATA', 'SAMSUNG', 'TDK', 'VISHAY', 'PANASONIC', 'KEMET', 'AVX'][i],
        warehouseId: 1,
        warehouseName: '主仓库',
        status: ['PENDING', 'RECEIVING', 'IQC_PENDING', 'IQC_PASS', 'COMPLETED', 'CANCELLED', 'PENDING', 'IQC_PENDING'][i],
        totalQty: 5000 + i * 1000,
        notes: '',
        operator: ['张三', '李四', '王五', '赵六', '张三', '李四', '王五', '赵六'][i],
        items: [],
        createTime: dayjs().subtract(i * 12, 'hour').format('YYYY-MM-DD HH:mm:ss'),
      }));
      setData(mockData);
      setTotal(8);
    } finally {
      setLoading(false);
    }
  }, [page, size, statusFilter]);

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      await createInboundOrder(values);
      message.success('创建成功');
      setCreateModalVisible(false);
      form.resetFields();
      fetchData();
    } catch (err: unknown) {
      if (err instanceof Error) message.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      title: '入库单号',
      dataIndex: 'orderNo',
      key: 'orderNo',
      width: 150,
      fixed: 'left' as const,
      render: (text: string) => <a>{text}</a>,
    },
    {
      title: '关联采购单',
      dataIndex: 'purchaseOrderNo',
      key: 'purchaseOrderNo',
      width: 150,
      render: (text: string) => text || '-',
    },
    {
      title: '供应商',
      dataIndex: 'supplierName',
      key: 'supplierName',
      width: 120,
    },
    {
      title: '仓库',
      dataIndex: 'warehouseName',
      key: 'warehouseName',
      width: 100,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (status: string) => {
        const info = inboundStatusMap[status];
        return info ? <Tag color={info.color}>{info.label}</Tag> : status;
      },
    },
    {
      title: '总数量',
      dataIndex: 'totalQty',
      key: 'totalQty',
      width: 100,
    },
    {
      title: '操作人',
      dataIndex: 'operator',
      key: 'operator',
      width: 80,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 170,
      render: (t: string) => t ? dayjs(t).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right' as const,
      render: (_: unknown, record: InboundOrder) => (
        <Space size="small">
          <Button type="link" size="small">详情</Button>
          {record.status === 'PENDING' && (
            <Button type="link" size="small">确认入库</Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>入库单</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalVisible(true)}>
          新建入库单
        </Button>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Input placeholder="搜索入库单号" prefix={<SearchOutlined />} onPressEnter={() => { setPage(1); fetchData(); }} />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="入库状态"
              allowClear
              style={{ width: '100%' }}
              value={statusFilter}
              onChange={(val) => { setStatusFilter(val); setPage(1); }}
              options={Object.entries(inboundStatusMap).map(([k, v]) => ({ value: k, label: v.label }))}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} onClick={() => { setPage(1); fetchData(); }}>搜索</Button>
              <Button onClick={() => setStatusFilter(undefined)}>重置</Button>
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
          scroll={{ x: 1200 }}
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

      <Modal
        title="新建入库单"
        open={createModalVisible}
        onOk={handleCreate}
        onCancel={() => setCreateModalVisible(false)}
        confirmLoading={saving}
        width={600}
        okText="创建"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="purchaseOrderId" label="关联采购订单">
                <Input placeholder="采购订单ID（可选）" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="warehouseId" label="入库仓库" rules={[{ required: true, message: '请选择仓库' }]}>
                <Select placeholder="选择仓库" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="notes" label="备注">
            <Input.TextArea rows={3} placeholder="入库备注" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default InboundOrderPage;
