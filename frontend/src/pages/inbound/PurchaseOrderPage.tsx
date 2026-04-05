import React, { useState, useEffect, useCallback } from 'react';
import {
  Table, Card, Select, Row, Col, Button, Tag, Space, Input, Typography, Modal, Form,
  InputNumber, DatePicker, message,
} from 'antd';
import {
  SearchOutlined, PlusOutlined, ReloadOutlined, SendOutlined, CheckOutlined,
} from '@ant-design/icons';
import {
  getPurchaseOrders, createPurchaseOrder, submitPurchaseOrder, confirmPurchaseOrder,
} from '../../api';
import type { PurchaseOrder } from '../../types';
import dayjs from 'dayjs';

const { Title } = Typography;

const poStatusMap: Record<string, { label: string; color: string }> = {
  DRAFT: { label: '草稿', color: 'default' },
  SUBMITTED: { label: '已提交', color: 'blue' },
  CONFIRMED: { label: '已确认', color: 'cyan' },
  RECEIVING: { label: '收货中', color: 'orange' },
  COMPLETED: { label: '已完成', color: 'green' },
  CANCELLED: { label: '已取消', color: 'red' },
};

const PurchaseOrderPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<PurchaseOrder[]>([]);
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
      const res = await getPurchaseOrders({ page, size, status: statusFilter });
      const result = res.data.data;
      setData(result.list || []);
      setTotal(result.total || 0);
    } catch {
      const mockData: PurchaseOrder[] = Array.from({ length: 8 }, (_, i) => ({
        id: i + 1,
        orderNo: `PO202604${String(i + 1).padStart(3, '0')}`,
        supplierId: i + 1,
        supplierName: ['YAGEO', 'MURATA', 'SAMSUNG', 'TDK', 'VISHAY', 'PANASONIC', 'KEMET', 'AVX'][i],
        status: ['DRAFT', 'SUBMITTED', 'CONFIRMED', 'RECEIVING', 'COMPLETED', 'CANCELLED', 'DRAFT', 'SUBMITTED'][i],
        totalAmount: 10000 + i * 2000,
        currency: 'CNY',
        expectedDeliveryDate: dayjs().add(7 + i * 3, 'day').format('YYYY-MM-DD'),
        notes: `采购订单备注${i + 1}`,
        items: [],
        createdBy: ['张三', '李四', '王五', '赵六', '张三', '李四', '王五', '赵六'][i],
        createTime: dayjs().subtract(i * 24, 'hour').format('YYYY-MM-DD HH:mm:ss'),
        updateTime: dayjs().subtract(i * 12, 'hour').format('YYYY-MM-DD HH:mm:ss'),
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
      await createPurchaseOrder(values);
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

  const handleSubmit = async (record: PurchaseOrder) => {
    try {
      await submitPurchaseOrder(record.id);
      message.success('提交成功');
      fetchData();
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : '提交失败');
    }
  };

  const handleConfirm = async (record: PurchaseOrder) => {
    try {
      await confirmPurchaseOrder(record.id);
      message.success('确认成功');
      fetchData();
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : '确认失败');
    }
  };

  const columns = [
    {
      title: '订单号',
      dataIndex: 'orderNo',
      key: 'orderNo',
      width: 150,
      fixed: 'left' as const,
      render: (text: string) => <a>{text}</a>,
    },
    {
      title: '供应商',
      dataIndex: 'supplierName',
      key: 'supplierName',
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const info = poStatusMap[status];
        return info ? <Tag color={info.color}>{info.label}</Tag> : status;
      },
    },
    {
      title: '总金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 120,
      render: (amount: number, record: PurchaseOrder) =>
        amount ? `¥${amount.toLocaleString()} ${record.currency || ''}` : '-',
    },
    {
      title: '预计交期',
      dataIndex: 'expectedDeliveryDate',
      key: 'expectedDeliveryDate',
      width: 120,
      render: (d: string) => d || '-',
    },
    {
      title: '创建人',
      dataIndex: 'createdBy',
      key: 'createdBy',
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
      title: '备注',
      dataIndex: 'notes',
      key: 'notes',
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right' as const,
      render: (_: unknown, record: PurchaseOrder) => (
        <Space size="small">
          <Button type="link" size="small">详情</Button>
          {record.status === 'DRAFT' && (
            <Button type="link" size="small" icon={<SendOutlined />} onClick={() => handleSubmit(record)}>提交</Button>
          )}
          {record.status === 'SUBMITTED' && (
            <Button type="link" size="small" icon={<CheckOutlined />} onClick={() => handleConfirm(record)}>确认</Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>采购订单</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalVisible(true)}>
          新建采购订单
        </Button>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Input placeholder="搜索订单号" prefix={<SearchOutlined />} onPressEnter={() => { setPage(1); fetchData(); }} />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="订单状态"
              allowClear
              style={{ width: '100%' }}
              value={statusFilter}
              onChange={(val) => { setStatusFilter(val); setPage(1); }}
              options={Object.entries(poStatusMap).map(([k, v]) => ({ value: k, label: v.label }))}
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
          scroll={{ x: 1300 }}
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
        title="新建采购订单"
        open={createModalVisible}
        onOk={handleCreate}
        onCancel={() => setCreateModalVisible(false)}
        confirmLoading={saving}
        width={700}
        okText="创建"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="supplierId" label="供应商" rules={[{ required: true, message: '请选择供应商' }]}>
                <Select placeholder="选择供应商" showSearch optionFilterProp="label" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="expectedDeliveryDate" label="预计交货日期">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="totalAmount" label="总金额">
                <InputNumber style={{ width: '100%' }} min={0} precision={2} placeholder="总金额" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="currency" label="币种" initialValue="CNY">
                <Select options={[
                  { value: 'CNY', label: '人民币 (CNY)' },
                  { value: 'USD', label: '美元 (USD)' },
                  { value: 'EUR', label: '欧元 (EUR)' },
                ]} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="notes" label="备注">
            <Input.TextArea rows={3} placeholder="订单备注" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PurchaseOrderPage;
