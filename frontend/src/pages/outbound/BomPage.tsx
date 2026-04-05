import React, { useState, useEffect, useCallback } from 'react';
import {
  Table, Card, Button, Tag, Space, Typography, Modal, Form, Input, InputNumber,
  Select, Switch, message, Row, Col, Divider,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, MinusCircleOutlined,
} from '@ant-design/icons';
import { getBomList, createBom, updateBom, deleteBom } from '../../api';
import type { Bom, BomItem } from '../../types';
import dayjs from 'dayjs';

const { Title } = Typography;

const BomPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Bom[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedBom, setSelectedBom] = useState<Bom | null>(null);
  const [editingBom, setEditingBom] = useState<Bom | null>(null);
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, [page, size]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getBomList({ page, size });
      const result = res.data.data;
      setData(result.list || []);
      setTotal(result.total || 0);
    } catch {
      const mockData: Bom[] = Array.from({ length: 5 }, (_, i) => ({
        id: i + 1,
        name: `产品${String.fromCharCode(65 + i)} BOM`,
        code: `BOM-${String(i + 1).padStart(3, '0')}`,
        version: `V${i + 1}.0`,
        description: `产品${String.fromCharCode(65 + i)}的物料清单`,
        status: i < 3 ? 'ACTIVE' : 'DRAFT',
        items: Array.from({ length: 3 + i }, (_, j) => ({
          id: i * 10 + j + 1,
          bomId: i + 1,
          componentId: j + 1,
          internalPartNo: `R-0402-${(10 + j)}K`,
          componentName: `电阻 ${(10 + j)}K 0402`,
          quantity: 10 + j * 5,
          unit: '个',
          referenceDesignator: `R${j + 1}, R${j + 2}`,
          substituteAllowed: j % 2 === 0,
          notes: '',
        })),
        createdBy: ['张三', '李四', '王五', '赵六', '张三'][i],
        createTime: dayjs().subtract(i * 48, 'hour').format('YYYY-MM-DD HH:mm:ss'),
        updateTime: dayjs().subtract(i * 24, 'hour').format('YYYY-MM-DD HH:mm:ss'),
      }));
      setData(mockData);
      setTotal(5);
    } finally {
      setLoading(false);
    }
  }, [page, size]);

  const handleAdd = () => {
    setEditingBom(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: Bom) => {
    setEditingBom(record);
    form.setFieldsValue({
      name: record.name,
      code: record.code,
      version: record.version,
      description: record.description,
      status: record.status,
      items: record.items?.map((item) => ({
        componentId: item.componentId,
        internalPartNo: item.internalPartNo,
        quantity: item.quantity,
        unit: item.unit,
        referenceDesignator: item.referenceDesignator,
        substituteAllowed: item.substituteAllowed,
        notes: item.notes,
      })),
    });
    setModalVisible(true);
  };

  const handleView = (record: Bom) => {
    setSelectedBom(record);
    setDetailVisible(true);
  };

  const handleDelete = async (record: Bom) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除BOM"${record.name}"吗？`,
      onOk: async () => {
        try {
          await deleteBom(record.id);
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
      if (editingBom) {
        await updateBom(editingBom.id, values);
        message.success('更新成功');
      } else {
        await createBom(values);
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
    { title: 'BOM编码', dataIndex: 'code', key: 'code', width: 130 },
    { title: '名称', dataIndex: 'name', key: 'name', width: 180 },
    { title: '版本', dataIndex: 'version', key: 'version', width: 80 },
    { title: '描述', dataIndex: 'description', key: 'description', ellipsis: true },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) => (
        <Tag color={status === 'ACTIVE' ? 'green' : 'default'}>{status === 'ACTIVE' ? '启用' : '草稿'}</Tag>
      ),
    },
    {
      title: '物料项数',
      key: 'itemCount',
      width: 90,
      render: (_: unknown, record: Bom) => record.items?.length || 0,
    },
    { title: '创建人', dataIndex: 'createdBy', key: 'createdBy', width: 80 },
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
      width: 200,
      fixed: 'right' as const,
      render: (_: unknown, record: Bom) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => handleView(record)}>详情</Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
          <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>删除</Button>
        </Space>
      ),
    },
  ];

  const itemColumns = [
    { title: '料号', dataIndex: 'internalPartNo', key: 'internalPartNo', width: 140 },
    { title: '名称', dataIndex: 'componentName', key: 'componentName', width: 140 },
    { title: '数量', dataIndex: 'quantity', key: 'quantity', width: 80 },
    { title: '单位', dataIndex: 'unit', key: 'unit', width: 60 },
    { title: '位号', dataIndex: 'referenceDesignator', key: 'referenceDesignator', width: 120 },
    {
      title: '允许替代',
      dataIndex: 'substituteAllowed',
      key: 'substituteAllowed',
      width: 90,
      render: (v: boolean) => v ? <Tag color="green">是</Tag> : <Tag>否</Tag>,
    },
    { title: '备注', dataIndex: 'notes', key: 'notes', ellipsis: true },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>BOM管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新建BOM</Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            current: page, pageSize: size, total,
            showSizeChanger: true, showQuickJumper: true,
            showTotal: (t) => `共 ${t} 条`,
            onChange: (p, s) => { setPage(p); setSize(s); },
          }}
        />
      </Card>

      <Modal
        title={selectedBom ? `${selectedBom.name} (${selectedBom.code})` : 'BOM详情'}
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={900}
      >
        {selectedBom && (
          <div>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={6}><strong>编码:</strong> {selectedBom.code}</Col>
              <Col span={6}><strong>版本:</strong> {selectedBom.version}</Col>
              <Col span={6}><strong>状态:</strong> {selectedBom.status === 'ACTIVE' ? '启用' : '草稿'}</Col>
              <Col span={6}><strong>物料项数:</strong> {selectedBom.items?.length || 0}</Col>
            </Row>
            {selectedBom.description && (
              <div style={{ marginBottom: 16 }}><strong>描述:</strong> {selectedBom.description}</div>
            )}
            <Table
              columns={itemColumns}
              dataSource={selectedBom.items || []}
              rowKey="id"
              size="small"
              pagination={false}
            />
          </div>
        )}
      </Modal>

      <Modal
        title={editingBom ? '编辑BOM' : '新建BOM'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        confirmLoading={saving}
        width={900}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="name" label="BOM名称" rules={[{ required: true, message: '请输入名称' }]}>
                <Input placeholder="BOM名称" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="code" label="BOM编码" rules={[{ required: true, message: '请输入编码' }]}>
                <Input placeholder="如: BOM-001" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="version" label="版本" rules={[{ required: true, message: '请输入版本' }]}>
                <Input placeholder="如: V1.0" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label="描述">
            <Input placeholder="BOM描述" />
          </Form.Item>

          <Divider orientation="left">物料清单</Divider>
          <Form.List name="items">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Row key={key} gutter={8} align="middle" style={{ marginBottom: 8 }}>
                    <Col span={5}>
                      <Form.Item {...restField} name={[name, 'internalPartNo']} rules={[{ required: true, message: '料号' }]}>
                        <Input placeholder="料号" size="small" />
                      </Form.Item>
                    </Col>
                    <Col span={3}>
                      <Form.Item {...restField} name={[name, 'quantity']} rules={[{ required: true, message: '数量' }]}>
                        <InputNumber placeholder="数量" size="small" min={1} style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col span={3}>
                      <Form.Item {...restField} name={[name, 'unit']}>
                        <Input placeholder="单位" size="small" />
                      </Form.Item>
                    </Col>
                    <Col span={5}>
                      <Form.Item {...restField} name={[name, 'referenceDesignator']}>
                        <Input placeholder="位号" size="small" />
                      </Form.Item>
                    </Col>
                    <Col span={3}>
                      <Form.Item {...restField} name={[name, 'substituteAllowed']} valuePropName="checked">
                        <Switch size="small" checkedChildren="替代" unCheckedChildren="无" />
                      </Form.Item>
                    </Col>
                    <Col span={3}>
                      <Form.Item {...restField} name={[name, 'notes']}>
                        <Input placeholder="备注" size="small" />
                      </Form.Item>
                    </Col>
                    <Col span={2}>
                      <MinusCircleOutlined onClick={() => remove(name)} style={{ color: '#ff4d4f' }} />
                    </Col>
                  </Row>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    添加物料
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>
    </div>
  );
};

export default BomPage;
