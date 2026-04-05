import React, { useState, useEffect, useCallback } from 'react';
import {
  Table, Card, Button, Tag, Space, Typography, Modal, Form, Input, InputNumber,
  Select, DatePicker, Rate, Switch, message, Row, Col,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
} from '@ant-design/icons';
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../../api';
import type { Supplier } from '../../types';
import dayjs from 'dayjs';

const { Title } = Typography;

const SupplierPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Supplier[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, [page, size]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getSuppliers({ page, size });
      const result = res.data.data;
      setData(result.list || []);
      setTotal(result.total || 0);
    } catch {
      const mockData: Supplier[] = [
        { id: 1, code: 'SUP001', name: 'YAGEO', shortName: '国巨', contact: '张经理', phone: '13800138001', email: 'zhang@yageo.com', rating: 5, leadTime: 14, paymentTerms: 'Net 30', enabled: true, createTime: '2025-06-01 10:00:00' },
        { id: 2, code: 'SUP002', name: 'MURATA', shortName: '村田', contact: '李经理', phone: '13800138002', email: 'li@murata.com', rating: 5, leadTime: 21, paymentTerms: 'Net 45', enabled: true, createTime: '2025-06-01 10:00:00' },
        { id: 3, code: 'SUP003', name: 'SAMSUNG', shortName: '三星', contact: '王经理', phone: '13800138003', email: 'wang@samsung.com', rating: 4, leadTime: 14, paymentTerms: 'Net 30', enabled: true, createTime: '2025-07-15 10:00:00' },
        { id: 4, code: 'SUP004', name: 'TDK', shortName: 'TDK', contact: '赵经理', phone: '13800138004', email: 'zhao@tdk.com', rating: 4, leadTime: 21, paymentTerms: 'Net 60', enabled: true, createTime: '2025-08-01 10:00:00' },
        { id: 5, code: 'SUP005', name: 'VISHAY', shortName: '威世', contact: '钱经理', phone: '13800138005', email: 'qian@vishay.com', rating: 3, leadTime: 28, paymentTerms: 'Net 30', enabled: false, createTime: '2025-09-01 10:00:00' },
      ];
      setData(mockData);
      setTotal(5);
    } finally {
      setLoading(false);
    }
  }, [page, size]);

  const handleAdd = () => {
    setEditingSupplier(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: Supplier) => {
    setEditingSupplier(record);
    form.setFieldsValue({
      ...record,
      qualificationExpiry: record.qualificationExpiry ? dayjs(record.qualificationExpiry) : undefined,
    });
    setModalVisible(true);
  };

  const handleDelete = async (record: Supplier) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除供应商"${record.name}"吗？`,
      onOk: async () => {
        try {
          await deleteSupplier(record.id);
          message.success('删除成功');
          fetchData();
        } catch (err: unknown) {
          message.error(err instanceof Error ? err.message : '删除失败');
        }
      },
    });
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      const submitData = {
        ...values,
        qualificationExpiry: values.qualificationExpiry?.format('YYYY-MM-DD'),
      };
      if (editingSupplier) {
        await updateSupplier(editingSupplier.id, submitData);
        message.success('更新成功');
      } else {
        await createSupplier(submitData);
        message.success('创建成功');
      }
      setModalVisible(false);
      fetchData();
    } catch (err: unknown) {
      if (err instanceof Error) message.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { title: '编码', dataIndex: 'code', key: 'code', width: 100 },
    { title: '名称', dataIndex: 'name', key: 'name', width: 120 },
    { title: '简称', dataIndex: 'shortName', key: 'shortName', width: 80 },
    { title: '联系人', dataIndex: 'contact', key: 'contact', width: 80 },
    { title: '电话', dataIndex: 'phone', key: 'phone', width: 130 },
    { title: '邮箱', dataIndex: 'email', key: 'email', width: 170 },
    {
      title: '资质',
      dataIndex: 'qualification',
      key: 'qualification',
      width: 100,
      render: (q: string) => {
        const map: Record<string, { label: string; color: string }> = {
          ISO9001: { label: 'ISO9001', color: 'green' },
          IATF16949: { label: 'IATF16949', color: 'blue' },
          AECQ200: { label: 'AEC-Q200', color: 'purple' },
        };
        return q ? <Tag color={map[q]?.color}>{map[q]?.label || q}</Tag> : '-';
      },
    },
    {
      title: '评级',
      dataIndex: 'rating',
      key: 'rating',
      width: 140,
      render: (rating: number) => <Rate disabled value={rating} />,
    },
    {
      title: '交期(天)',
      dataIndex: 'leadTime',
      key: 'leadTime',
      width: 90,
    },
    {
      title: '状态',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 80,
      render: (enabled: boolean) => <Tag color={enabled ? 'green' : 'default'}>{enabled ? '启用' : '停用'}</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right' as const,
      render: (_: unknown, record: Supplier) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
          <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>删除</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>供应商管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增供应商</Button>
      </div>

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
        title={editingSupplier ? '编辑供应商' : '新增供应商'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        confirmLoading={saving}
        width={700}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="code" label="供应商编码" rules={[{ required: true, message: '请输入编码' }]}>
                <Input placeholder="如: SUP006" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="name" label="供应商名称" rules={[{ required: true, message: '请输入名称' }]}>
                <Input placeholder="供应商全称" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="shortName" label="简称">
                <Input placeholder="简称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="contact" label="联系人">
                <Input placeholder="联系人" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="phone" label="电话">
                <Input placeholder="联系电话" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="email" label="邮箱">
                <Input placeholder="邮箱地址" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="address" label="地址">
                <Input placeholder="地址" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="qualification" label="资质认证">
                <Select placeholder="选择资质" allowClear>
                  <Select.Option value="ISO9001">ISO9001</Select.Option>
                  <Select.Option value="IATF16949">IATF16949</Select.Option>
                  <Select.Option value="AECQ200">AEC-Q200</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="qualificationExpiry" label="资质到期日">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="rating" label="评级" initialValue={3}>
                <Rate />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="leadTime" label="交期(天)">
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="paymentTerms" label="付款条件">
                <Select placeholder="付款条件">
                  <Select.Option value="Net 30">Net 30</Select.Option>
                  <Select.Option value="Net 45">Net 45</Select.Option>
                  <Select.Option value="Net 60">Net 60</Select.Option>
                  <Select.Option value="Net 90">Net 90</Select.Option>
                  <Select.Option value="COD">货到付款</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="enabled" label="状态" valuePropName="checked" initialValue={true}>
                <Switch checkedChildren="启用" unCheckedChildren="停用" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default SupplierPage;
