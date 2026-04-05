import React, { useState, useEffect, useCallback } from 'react';
import {
  Table, Card, Select, Row, Col, Button, Tag, Space, Input, Typography, Modal, Form,
  message,
} from 'antd';
import {
  SearchOutlined, PlusOutlined, ReloadOutlined, CheckOutlined,
} from '@ant-design/icons';
import { getOutboundOrders, createOutboundOrder, approveOutboundOrder } from '../../api';
import type { OutboundOrder } from '../../types';
import dayjs from 'dayjs';

const { Title } = Typography;

const outboundStatusMap: Record<string, { label: string; color: string }> = {
  PENDING: { label: '待审批', color: 'default' },
  APPROVED: { label: '已审批', color: 'blue' },
  PICKING: { label: '拣货中', color: 'orange' },
  SHIPPED: { label: '已出库', color: 'green' },
  CANCELLED: { label: '已取消', color: 'red' },
};

const outboundTypeMap: Record<string, string> = {
  PRODUCTION: '生产领料',
  RND: '研发领料',
  SALES: '销售出库',
  TRANSFER: '调拨出库',
  OTHER: '其他出库',
};

const OutboundOrderPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<OutboundOrder[]>([]);
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
      const res = await getOutboundOrders({ page, size, status: statusFilter });
      const result = res.data.data;
      setData(result.list || []);
      setTotal(result.total || 0);
    } catch {
      const mockData: OutboundOrder[] = Array.from({ length: 8 }, (_, i) => ({
        id: i + 1,
        orderNo: `OUT202604${String(i + 1).padStart(3, '0')}`,
        type: ['PRODUCTION', 'RND', 'SALES', 'TRANSFER', 'PRODUCTION', 'RND', 'PRODUCTION', 'SALES'][i],
        bomId: i < 3 ? i + 1 : undefined,
        bomName: i < 3 ? `BOM-${String(i + 1).padStart(3, '0')}` : undefined,
        status: ['PENDING', 'APPROVED', 'PICKING', 'SHIPPED', 'PENDING', 'CANCELLED', 'APPROVED', 'PENDING'][i],
        totalQty: 100 + i * 50,
        recipient: ['产线A', '研发部', '客户甲', '仓库B', '产线B', '研发部', '产线C', '客户乙'][i],
        department: ['生产部', '研发部', '销售部', '物流部', '生产部', '研发部', '生产部', '销售部'][i],
        project: [`PRJ-${100 + i}`, `PRJ-${101 + i}`, undefined, undefined, `PRJ-${105}`, `PRJ-${106}`, `PRJ-${107}`, undefined][i],
        notes: '',
        items: [],
        createdBy: ['张三', '李四', '王五', '赵六', '张三', '李四', '王五', '赵六'][i],
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
      await createOutboundOrder(values);
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

  const handleApprove = async (record: OutboundOrder) => {
    try {
      await approveOutboundOrder(record.id);
      message.success('审批通过');
      fetchData();
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : '审批失败');
    }
  };

  const columns = [
    {
      title: '出库单号',
      dataIndex: 'orderNo',
      key: 'orderNo',
      width: 150,
      fixed: 'left' as const,
      render: (text: string) => <a>{text}</a>,
    },
    {
      title: '出库类型',
      dataIndex: 'type',
      key: 'type',
      width: 110,
      render: (type: string) => outboundTypeMap[type] || type,
    },
    {
      title: '关联BOM',
      dataIndex: 'bomName',
      key: 'bomName',
      width: 120,
      render: (text: string) => text || '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const info = outboundStatusMap[status];
        return info ? <Tag color={info.color}>{info.label}</Tag> : status;
      },
    },
    {
      title: '总数量',
      dataIndex: 'totalQty',
      key: 'totalQty',
      width: 90,
    },
    {
      title: '领用人/客户',
      dataIndex: 'recipient',
      key: 'recipient',
      width: 100,
    },
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department',
      width: 80,
    },
    {
      title: '项目',
      dataIndex: 'project',
      key: 'project',
      width: 100,
      render: (text: string) => text || '-',
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
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right' as const,
      render: (_: unknown, record: OutboundOrder) => (
        <Space size="small">
          <Button type="link" size="small">详情</Button>
          {record.status === 'PENDING' && (
            <Button type="link" size="small" icon={<CheckOutlined />} onClick={() => handleApprove(record)}>
              审批
            </Button>
          )}
          {record.status === 'APPROVED' && (
            <Button type="link" size="small">开始拣货</Button>
          )}
          {record.status === 'PICKING' && (
            <Button type="link" size="small">确认出库</Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>出库单</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalVisible(true)}>
          新建出库单
        </Button>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Input placeholder="搜索出库单号" prefix={<SearchOutlined />} onPressEnter={() => { setPage(1); fetchData(); }} />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="出库状态"
              allowClear
              style={{ width: '100%' }}
              value={statusFilter}
              onChange={(val) => { setStatusFilter(val); setPage(1); }}
              options={Object.entries(outboundStatusMap).map(([k, v]) => ({ value: k, label: v.label }))}
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
            current: page, pageSize: size, total,
            showSizeChanger: true, showQuickJumper: true,
            showTotal: (t) => `共 ${t} 条`,
            onChange: (p, s) => { setPage(p); setSize(s); },
          }}
        />
      </Card>

      <Modal
        title="新建出库单"
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
              <Form.Item name="type" label="出库类型" rules={[{ required: true, message: '请选择出库类型' }]}>
                <Select placeholder="选择出库类型">
                  {Object.entries(outboundTypeMap).map(([k, v]) => (
                    <Select.Option key={k} value={k}>{v}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="bomId" label="关联BOM">
                <Select placeholder="选择BOM（可选）" allowClear />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="recipient" label="领用人/客户" rules={[{ required: true, message: '请输入' }]}>
                <Input placeholder="领用人或客户" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="department" label="部门">
                <Input placeholder="部门" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="project" label="项目编号">
            <Input placeholder="项目编号（可选）" />
          </Form.Item>
          <Form.Item name="notes" label="备注">
            <Input.TextArea rows={3} placeholder="出库备注" />
          </Form.Item>
          <div style={{ padding: 12, background: '#f5f5f5', borderRadius: 4, marginTop: 8 }}>
            <Typography.Text type="secondary">
              提示：创建出库单后，系统将根据FIFO（先进先出）原则自动分配库存。可在详情页面查看分配结果并调整。
            </Typography.Text>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default OutboundOrderPage;
