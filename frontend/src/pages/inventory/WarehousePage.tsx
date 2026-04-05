import React, { useState, useEffect } from 'react';
import {
  Card, Row, Col, Button, Tag, Modal, Form, Input, Select, Space, message, Typography, Progress,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, EnvironmentOutlined,
} from '@ant-design/icons';
import { getWarehouses, createWarehouse, updateWarehouse } from '../../api';
import type { Warehouse } from '../../types';

const { Title, Text } = Typography;

const warehouseTypeMap: Record<string, { label: string; color: string }> = {
  RAW: { label: '原材料仓', color: 'blue' },
  FINISHED: { label: '成品仓', color: 'green' },
  SEMI: { label: '半成品仓', color: 'orange' },
  DEFECT: { label: '不良品仓', color: 'red' },
  RETURN: { label: '退货仓', color: 'purple' },
};

const WarehousePage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    setLoading(true);
    try {
      const res = await getWarehouses();
      setWarehouses(res.data.data || []);
    } catch {
      setWarehouses([
        { id: 1, name: '主仓库', code: 'WH01', type: 'RAW', address: 'A栋1楼', description: '存放原材料', enabled: true, locations: [] },
        { id: 2, name: '成品仓库', code: 'WH02', type: 'FINISHED', address: 'B栋2楼', description: '存放成品', enabled: true, locations: [] },
        { id: 3, name: '不良品仓', code: 'WH03', type: 'DEFECT', address: 'A栋负1楼', description: '存放不良品', enabled: true, locations: [] },
        { id: 4, name: '退货仓', code: 'WH04', type: 'RETURN', address: 'C栋1楼', description: '存放退货物料', enabled: false, locations: [] },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingWarehouse(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (wh: Warehouse) => {
    setEditingWarehouse(wh);
    form.setFieldsValue(wh);
    setModalVisible(true);
  };

  const handleDelete = async (wh: Warehouse) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除仓库"${wh.name}"吗？`,
      onOk: async () => {
        try {
          await deleteWarehouse(wh.id);
          message.success('删除成功');
          fetchWarehouses();
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
      if (editingWarehouse) {
        await updateWarehouse(editingWarehouse.id, values);
        message.success('更新成功');
      } else {
        await createWarehouse(values);
        message.success('创建成功');
      }
      setModalVisible(false);
      fetchWarehouses();
    } catch (err: unknown) {
      if (err instanceof Error) message.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  // 模拟库位数据
  const locations = selectedWarehouse ? [
    { id: 1, name: 'A区', code: `${selectedWarehouse.code}-A`, type: 'ZONE', usage: 75, children: [
      { id: 11, name: 'A-01', code: `${selectedWarehouse.code}-A-01`, type: 'SHELF', usage: 80 },
      { id: 12, name: 'A-02', code: `${selectedWarehouse.code}-A-02`, type: 'SHELF', usage: 60 },
      { id: 13, name: 'A-03', code: `${selectedWarehouse.code}-A-03`, type: 'SHELF', usage: 90 },
    ]},
    { id: 2, name: 'B区', code: `${selectedWarehouse.code}-B`, type: 'ZONE', usage: 45, children: [
      { id: 21, name: 'B-01', code: `${selectedWarehouse.code}-B-01`, type: 'SHELF', usage: 30 },
      { id: 22, name: 'B-02', code: `${selectedWarehouse.code}-B-02`, type: 'SHELF', usage: 60 },
    ]},
    { id: 3, name: 'C区', code: `${selectedWarehouse.code}-C`, type: 'ZONE', usage: 20, children: [
      { id: 31, name: 'C-01', code: `${selectedWarehouse.code}-C-01`, type: 'SHELF', usage: 20 },
    ]},
  ] : [];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>仓库管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增仓库
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        {warehouses.map((wh) => {
          const typeInfo = warehouseTypeMap[wh.type];
          const mockCapacity = Math.floor(Math.random() * 100);
          return (
            <Col xs={24} sm={12} lg={6} key={wh.id}>
              <Card
                hoverable
                style={{
                  borderColor: selectedWarehouse?.id === wh.id ? '#1890ff' : undefined,
                  borderWidth: selectedWarehouse?.id === wh.id ? 2 : 1,
                }}
                onClick={() => setSelectedWarehouse(wh)}
                actions={[
                  <Button type="link" size="small" icon={<EditOutlined />} onClick={(e) => { e.stopPropagation(); handleEdit(wh); }}>编辑</Button>,
                  <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={(e) => { e.stopPropagation(); handleDelete(wh); }}>删除</Button>,
                ]}
              >
                <div style={{ marginBottom: 12 }}>
                  <Text strong style={{ fontSize: 16 }}>{wh.name}</Text>
                  <Tag color={typeInfo?.color || 'default'} style={{ marginLeft: 8 }}>
                    {typeInfo?.label || wh.type}
                  </Tag>
                  {!wh.enabled && <Tag color="default">已禁用</Tag>}
                </div>
                <div style={{ marginBottom: 8 }}>
                  <Text type="secondary">编码: {wh.code}</Text>
                </div>
                {wh.address && (
                  <div style={{ marginBottom: 8 }}>
                    <EnvironmentOutlined /> <Text type="secondary">{wh.address}</Text>
                  </div>
                )}
                <div style={{ marginBottom: 8 }}>
                  <Text type="secondary">容量使用率</Text>
                  <Progress
                    percent={mockCapacity}
                    size="small"
                    status={mockCapacity > 90 ? 'exception' : mockCapacity > 70 ? 'active' : 'normal'}
                  />
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>

      {selectedWarehouse && (
        <Card
          title={`${selectedWarehouse.name} - 库位信息`}
          style={{ marginTop: 16 }}
        >
          <Row gutter={[16, 16]}>
            {locations.map((zone) => (
              <Col xs={24} md={8} key={zone.id}>
                <Card size="small" title={`${zone.name} (${zone.code})`} type="inner">
                  <div style={{ marginBottom: 12 }}>
                    <Text type="secondary">区域使用率</Text>
                    <Progress percent={zone.usage} size="small" />
                  </div>
                  {zone.children?.map((shelf) => (
                    <div key={shelf.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, padding: '4px 8px', background: '#fafafa', borderRadius: 4 }}>
                      <Text>{shelf.name}</Text>
                      <Progress percent={shelf.usage} size="small" style={{ width: 100 }} />
                    </div>
                  ))}
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      )}

      <Modal
        title={editingWarehouse ? '编辑仓库' : '新增仓库'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        confirmLoading={saving}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="仓库名称" rules={[{ required: true, message: '请输入仓库名称' }]}>
            <Input placeholder="仓库名称" />
          </Form.Item>
          <Form.Item name="code" label="仓库编码" rules={[{ required: true, message: '请输入仓库编码' }]}>
            <Input placeholder="仓库编码" />
          </Form.Item>
          <Form.Item name="type" label="仓库类型" rules={[{ required: true, message: '请选择仓库类型' }]}>
            <Select
              placeholder="选择仓库类型"
              options={Object.entries(warehouseTypeMap).map(([k, v]) => ({ value: k, label: v.label }))}
            />
          </Form.Item>
          <Form.Item name="address" label="地址">
            <Input placeholder="仓库地址" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} placeholder="仓库描述" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default WarehousePage;
