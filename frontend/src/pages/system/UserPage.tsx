import React, { useState, useEffect, useCallback } from 'react';
import {
  Table, Card, Button, Tag, Space, Typography, Modal, Form, Input, Select, Switch,
  message, Row, Col,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
} from '@ant-design/icons';
import { getUsers, createUser, updateUser, deleteUser, toggleUserStatus } from '../../api';
import type { User } from '../../types';
import dayjs from 'dayjs';

const { Title } = Typography;

const roleMap: Record<string, { label: string; color: string }> = {
  ADMIN: { label: '管理员', color: 'red' },
  WAREHOUSE: { label: '仓库管理员', color: 'blue' },
  PURCHASE: { label: '采购员', color: 'green' },
  PRODUCTION: { label: '生产人员', color: 'orange' },
  QUALITY: { label: '质检员', color: 'purple' },
  VIEWER: { label: '只读用户', color: 'default' },
};

const UserPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, [page, size]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getUsers({ page, size });
      const result = res.data.data;
      setData(result.list || []);
      setTotal(result.total || 0);
    } catch {
      const mockData: User[] = [
        { id: 1, username: 'admin', realName: '系统管理员', email: 'admin@ecm.com', phone: '13800138000', role: 'ADMIN', enabled: true, createTime: '2026-01-01 00:00:00' },
        { id: 2, username: 'zhangsan', realName: '张三', email: 'zhangsan@ecm.com', phone: '13800138001', role: 'WAREHOUSE', enabled: true, createTime: '2026-01-15 10:00:00' },
        { id: 3, username: 'lisi', realName: '李四', email: 'lisi@ecm.com', phone: '13800138002', role: 'PURCHASE', enabled: true, createTime: '2026-01-15 10:00:00' },
        { id: 4, username: 'wangwu', realName: '王五', email: 'wangwu@ecm.com', phone: '13800138003', role: 'PRODUCTION', enabled: true, createTime: '2026-02-01 10:00:00' },
        { id: 5, username: 'zhaoliu', realName: '赵六', email: 'zhaoliu@ecm.com', phone: '13800138004', role: 'QUALITY', enabled: true, createTime: '2026-02-01 10:00:00' },
        { id: 6, username: 'guest', realName: '访客用户', email: 'guest@ecm.com', phone: '', role: 'VIEWER', enabled: false, createTime: '2026-03-01 10:00:00' },
      ];
      setData(mockData);
      setTotal(6);
    } finally {
      setLoading(false);
    }
  }, [page, size]);

  const handleAdd = () => {
    setEditingUser(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: User) => {
    setEditingUser(record);
    form.setFieldsValue({
      username: record.username,
      realName: record.realName,
      email: record.email,
      phone: record.phone,
      role: record.role,
      enabled: record.enabled,
    });
    setModalVisible(true);
  };

  const handleDelete = async (record: User) => {
    if (record.username === 'admin') {
      message.warning('不能删除管理员账户');
      return;
    }
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除用户"${record.realName}"吗？`,
      onOk: async () => {
        try {
          await deleteUser(record.id);
          message.success('删除成功');
          fetchData();
        } catch (err: unknown) {
          message.error(err instanceof Error ? err.message : '删除失败');
        }
      },
    });
  };

  const handleToggleStatus = async (record: User) => {
    try {
      await toggleUserStatus(record.id, !record.enabled);
      message.success(record.enabled ? '已禁用' : '已启用');
      fetchData();
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : '操作失败');
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      if (editingUser) {
        await updateUser(editingUser.id, values);
        message.success('更新成功');
      } else {
        await createUser(values);
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
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      width: 120,
    },
    {
      title: '姓名',
      dataIndex: 'realName',
      key: 'realName',
      width: 100,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 180,
    },
    {
      title: '电话',
      dataIndex: 'phone',
      key: 'phone',
      width: 130,
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 110,
      render: (role: string) => {
        const info = roleMap[role];
        return info ? <Tag color={info.color}>{info.label}</Tag> : role;
      },
    },
    {
      title: '状态',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 80,
      render: (enabled: boolean) => <Tag color={enabled ? 'green' : 'default'}>{enabled ? '启用' : '停用'}</Tag>,
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
      width: 220,
      fixed: 'right' as const,
      render: (_: unknown, record: User) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => handleToggleStatus(record)}
          >
            {record.enabled ? '禁用' : '启用'}
          </Button>
          {record.username !== 'admin' && (
            <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>
              删除
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>用户管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增用户
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1100 }}
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
        title={editingUser ? '编辑用户' : '新增用户'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        confirmLoading={saving}
        width={600}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="username"
                label="用户名"
                rules={[
                  { required: true, message: '请输入用户名' },
                  { pattern: /^[a-zA-Z0-9_]+$/, message: '只能包含字母、数字和下划线' },
                ]}
              >
                <Input placeholder="用户名" disabled={!!editingUser} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="realName"
                label="姓名"
                rules={[{ required: true, message: '请输入姓名' }]}
              >
                <Input placeholder="姓名" />
              </Form.Item>
            </Col>
          </Row>
          {!editingUser && (
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="password"
                  label="密码"
                  rules={[
                    { required: true, message: '请输入密码' },
                    { min: 6, message: '密码至少6位' },
                  ]}
                >
                  <Input.Password placeholder="密码" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="confirmPassword"
                  label="确认密码"
                  dependencies={['password']}
                  rules={[
                    { required: true, message: '请确认密码' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('两次输入的密码不一致'));
                      },
                    }),
                  ]}
                >
                  <Input.Password placeholder="确认密码" />
                </Form.Item>
              </Col>
            </Row>
          )}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="email" label="邮箱" rules={[{ type: 'email', message: '请输入有效的邮箱地址' }]}>
                <Input placeholder="邮箱" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone" label="电话">
                <Input placeholder="电话" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="role" label="角色" rules={[{ required: true, message: '请选择角色' }]}>
                <Select placeholder="选择角色">
                  {Object.entries(roleMap).map(([k, v]) => (
                    <Select.Option key={k} value={k}>{v.label}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
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

export default UserPage;
