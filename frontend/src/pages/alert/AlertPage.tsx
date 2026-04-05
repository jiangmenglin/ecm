import React, { useState, useEffect, useCallback } from 'react';
import {
  Table, Card, Select, Row, Col, Button, Tag, Space, Typography, Tabs, Modal,
  Form, Input, Switch, InputNumber, message,
} from 'antd';
import {
  SearchOutlined, ReloadOutlined, CheckOutlined, StopOutlined,
} from '@ant-design/icons';
import { getAlerts, handleAlert, ignoreAlert, getAlertRules, createAlertRule, updateAlertRule } from '../../api';
import type { AlertRecord, AlertRule } from '../../types';
import dayjs from 'dayjs';

const { Title } = Typography;
const { TextArea } = Input;

const alertTypeMap: Record<string, string> = {
  LOW_STOCK: '库存不足',
  OVERSTOCK: '库存积压',
  EXPIRING: '即将过期',
  EXPIRED: '已过期',
  MSD_WARNING: 'MSD预警',
  MSD_EXPIRED: 'MSD超限',
  LIFECYCLE: '生命周期变更',
};

const alertLevelMap: Record<string, { label: string; color: string }> = {
  HIGH: { label: '高', color: 'red' },
  MEDIUM: { label: '中', color: 'orange' },
  LOW: { label: '低', color: 'blue' },
};

const alertStatusMap: Record<string, { label: string; color: string }> = {
  PENDING: { label: '待处理', color: 'warning' },
  HANDLED: { label: '已处理', color: 'success' },
  IGNORED: { label: '已忽略', color: 'default' },
};

const AlertPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('alerts');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AlertRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [filters, setFilters] = useState({
    type: undefined as string | undefined,
    level: undefined as string | undefined,
    status: 'PENDING' as string | undefined,
  });

  // 预警规则
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [ruleModalVisible, setRuleModalVisible] = useState(false);
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null);
  const [ruleForm] = Form.useForm();
  const [saving, setSaving] = useState(false);

  // 处理预警
  const [handleModalVisible, setHandleModalVisible] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<AlertRecord | null>(null);
  const [handleForm] = Form.useForm();

  useEffect(() => {
    if (activeTab === 'alerts') fetchAlerts();
    if (activeTab === 'rules') fetchRules();
  }, [activeTab, page, size]);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAlerts({ page, size, ...filters });
      const result = res.data.data;
      setData(result.list || []);
      setTotal(result.total || 0);
    } catch {
      const mockData: AlertRecord[] = Array.from({ length: 8 }, (_, i) => ({
        id: i + 1,
        type: ['LOW_STOCK', 'EXPIRING', 'MSD_WARNING', 'OVERSTOCK', 'EXPIRED', 'LOW_STOCK', 'MSD_EXPIRED', 'LIFECYCLE'][i],
        level: ['HIGH', 'MEDIUM', 'HIGH', 'LOW', 'HIGH', 'MEDIUM', 'HIGH', 'LOW'][i],
        componentId: i + 1,
        internalPartNo: `R-0402-${(10 + i)}K`,
        componentName: `电阻 ${(10 + i)}K 0402`,
        title: ['库存不足预警', '物料即将过期', 'MSD暴露超时', '库存积压预警', '物料已过期', '库存不足预警', 'MSD暴露超限', '生命周期变更'][i],
        message: [
          `当前库存500，低于安全库存2000`,
          `批次B20240101将于30天后过期`,
          `MSD等级3，已暴露超过168小时`,
          `库存超过最大库存量200%`,
          `批次B20231001已过期`,
          `当前库存200，低于安全库存1000`,
          `MSD等级4，暴露超过72小时上限`,
          `制造商通知NRND状态`,
        ][i],
        status: ['PENDING', 'PENDING', 'PENDING', 'HANDLED', 'PENDING', 'IGNORED', 'PENDING', 'PENDING'][i],
        triggerValue: ['500', '30天', '168h', '200%', '0天', '200', '72h', 'NRND'][i],
        thresholdValue: ['2000', '30天', '168h', '150%', '0天', '1000', '72h', ''][i],
        handledBy: i === 3 ? '张三' : undefined,
        handleTime: i === 3 ? dayjs().subtract(2, 'hour').format('YYYY-MM-DD HH:mm:ss') : undefined,
        handleNotes: i === 3 ? '已安排退回部分库存' : undefined,
        createTime: dayjs().subtract(i * 3, 'hour').format('YYYY-MM-DD HH:mm:ss'),
      }));
      setData(mockData);
      setTotal(8);
    } finally {
      setLoading(false);
    }
  }, [page, size, filters]);

  const fetchRules = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAlertRules();
      setRules(res.data.data || []);
    } catch {
      setRules([
        { id: 1, name: '低库存预警', type: 'LOW_STOCK', description: '当库存低于安全库存时触发', condition: 'stock_qty < safety_stock', threshold: 0, enabled: true, notifyRoles: ['ADMIN', 'WAREHOUSE'], createTime: '2026-01-01 00:00:00', updateTime: '2026-01-01 00:00:00' },
        { id: 2, name: '库存积压预警', type: 'OVERSTOCK', description: '当库存超过最大库存量150%时触发', condition: 'stock_qty > max_stock * 1.5', threshold: 150, unit: '%', enabled: true, notifyRoles: ['ADMIN', 'PURCHASE'], createTime: '2026-01-01 00:00:00', updateTime: '2026-01-01 00:00:00' },
        { id: 3, name: '即将过期预警', type: 'EXPIRING', description: '当物料将在30天内过期时触发', condition: 'days_to_expiry < 30', threshold: 30, unit: '天', enabled: true, notifyRoles: ['ADMIN', 'WAREHOUSE', 'QUALITY'], createTime: '2026-01-01 00:00:00', updateTime: '2026-01-01 00:00:00' },
        { id: 4, name: 'MSD预警', type: 'MSD_WARNING', description: '当MSD暴露时间达到阈值80%时触发', condition: 'exposure_duration > threshold * 0.8', threshold: 80, unit: '%', enabled: true, notifyRoles: ['ADMIN', 'PRODUCTION'], createTime: '2026-01-01 00:00:00', updateTime: '2026-01-01 00:00:00' },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAlertAction = (record: AlertRecord) => {
    setSelectedAlert(record);
    handleForm.resetFields();
    setHandleModalVisible(true);
  };

  const submitHandle = async () => {
    try {
      const values = await handleForm.validateFields();
      setSaving(true);
      await handleAlert(selectedAlert!.id, values);
      message.success('处理成功');
      setHandleModalVisible(false);
      fetchAlerts();
    } catch (err: unknown) {
      if (err instanceof Error) message.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleIgnore = async (record: AlertRecord) => {
    try {
      await ignoreAlert(record.id);
      message.success('已忽略');
      fetchAlerts();
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : '操作失败');
    }
  };

  const handleEditRule = (rule?: AlertRule) => {
    setEditingRule(rule || null);
    if (rule) {
      ruleForm.setFieldsValue(rule);
    } else {
      ruleForm.resetFields();
    }
    setRuleModalVisible(true);
  };

  const handleSaveRule = async () => {
    try {
      const values = await ruleForm.validateFields();
      setSaving(true);
      if (editingRule) {
        await updateAlertRule(editingRule.id, values);
        message.success('更新成功');
      } else {
        await createAlertRule(values);
        message.success('创建成功');
      }
      setRuleModalVisible(false);
      fetchRules();
    } catch (err: unknown) {
      if (err instanceof Error) message.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const alertColumns = [
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 110,
      render: (type: string) => alertTypeMap[type] || type,
    },
    {
      title: '级别',
      dataIndex: 'level',
      key: 'level',
      width: 70,
      render: (level: string) => {
        const info = alertLevelMap[level];
        return info ? <Tag color={info.color}>{info.label}</Tag> : level;
      },
    },
    { title: '料号', dataIndex: 'internalPartNo', key: 'internalPartNo', width: 130 },
    { title: '元件名称', dataIndex: 'componentName', key: 'componentName', width: 130 },
    { title: '标题', dataIndex: 'title', key: 'title', width: 130 },
    { title: '详情', dataIndex: 'message', key: 'message', ellipsis: true },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) => {
        const info = alertStatusMap[status];
        return info ? <Tag color={info.color}>{info.label}</Tag> : status;
      },
    },
    {
      title: '触发值/阈值',
      key: 'values',
      width: 120,
      render: (_: unknown, record: AlertRecord) =>
        `${record.triggerValue || '-'} / ${record.thresholdValue || '-'}`,
    },
    {
      title: '时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 160,
      render: (t: string) => t ? dayjs(t).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      fixed: 'right' as const,
      render: (_: unknown, record: AlertRecord) => (
        <Space size="small">
          {record.status === 'PENDING' && (
            <>
              <Button type="link" size="small" icon={<CheckOutlined />} onClick={() => handleAlertAction(record)}>
                处理
              </Button>
              <Button type="link" size="small" icon={<StopOutlined />} onClick={() => handleIgnore(record)}>
                忽略
              </Button>
            </>
          )}
          {record.status !== 'PENDING' && <span style={{ color: '#999' }}>--</span>}
        </Space>
      ),
    },
  ];

  const ruleColumns = [
    { title: '规则名称', dataIndex: 'name', key: 'name', width: 140 },
    { title: '类型', dataIndex: 'type', key: 'type', width: 110, render: (t: string) => alertTypeMap[t] || t },
    { title: '描述', dataIndex: 'description', key: 'description', ellipsis: true },
    { title: '阈值', dataIndex: 'threshold', key: 'threshold', width: 80, render: (v: number, r: AlertRule) => `${v}${r.unit || ''}` },
    {
      title: '状态',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 80,
      render: (enabled: boolean) => <Tag color={enabled ? 'green' : 'default'}>{enabled ? '启用' : '停用'}</Tag>,
    },
    { title: '通知角色', dataIndex: 'notifyRoles', key: 'notifyRoles', width: 200, render: (roles: string[]) => roles?.map((r) => <Tag key={r}>{r}</Tag>) },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_: unknown, record: AlertRule) => (
        <Button type="link" size="small" onClick={() => handleEditRule(record)}>编辑</Button>
      ),
    },
  ];

  const tabItems = [
    {
      key: 'alerts',
      label: '预警列表',
      children: (
        <>
          <Card style={{ marginBottom: 16 }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={8} md={6}>
                <Select
                  placeholder="预警类型"
                  allowClear
                  style={{ width: '100%' }}
                  value={filters.type}
                  onChange={(val) => setFilters({ ...filters, type: val })}
                  options={Object.entries(alertTypeMap).map(([k, v]) => ({ value: k, label: v }))}
                />
              </Col>
              <Col xs={24} sm={8} md={6}>
                <Select
                  placeholder="预警级别"
                  allowClear
                  style={{ width: '100%' }}
                  value={filters.level}
                  onChange={(val) => setFilters({ ...filters, level: val })}
                  options={Object.entries(alertLevelMap).map(([k, v]) => ({ value: k, label: v.label }))}
                />
              </Col>
              <Col xs={24} sm={8} md={6}>
                <Select
                  placeholder="处理状态"
                  allowClear
                  style={{ width: '100%' }}
                  value={filters.status}
                  onChange={(val) => setFilters({ ...filters, status: val })}
                  options={Object.entries(alertStatusMap).map(([k, v]) => ({ value: k, label: v.label }))}
                />
              </Col>
              <Col xs={24} sm={8} md={6}>
                <Space>
                  <Button type="primary" icon={<SearchOutlined />} onClick={() => { setPage(1); fetchAlerts(); }}>搜索</Button>
                  <Button onClick={() => setFilters({ type: undefined, level: undefined, status: undefined })}>重置</Button>
                  <Button icon={<ReloadOutlined />} onClick={() => fetchAlerts()}>刷新</Button>
                </Space>
              </Col>
            </Row>
          </Card>
          <Card>
            <Table
              columns={alertColumns}
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
        </>
      ),
    },
    {
      key: 'rules',
      label: '预警规则',
      children: (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <Button type="primary" onClick={() => handleEditRule()}>新增规则</Button>
          </div>
          <Card>
            <Table
              columns={ruleColumns}
              dataSource={rules}
              rowKey="id"
              loading={loading}
            />
          </Card>
        </>
      ),
    },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>预警中心</Title>
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />

      <Modal
        title="处理预警"
        open={handleModalVisible}
        onOk={submitHandle}
        onCancel={() => setHandleModalVisible(false)}
        confirmLoading={saving}
        okText="确认处理"
        cancelText="取消"
      >
        {selectedAlert && (
          <div style={{ marginBottom: 16, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
            <div><strong>预警:</strong> {selectedAlert.title}</div>
            <div><strong>元件:</strong> {selectedAlert.internalPartNo} - {selectedAlert.componentName}</div>
            <div><strong>详情:</strong> {selectedAlert.message}</div>
          </div>
        )}
        <Form form={handleForm} layout="vertical">
          <Form.Item name="handleNotes" label="处理说明" rules={[{ required: true, message: '请输入处理说明' }]}>
            <TextArea rows={4} placeholder="请描述处理措施" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingRule ? '编辑规则' : '新增规则'}
        open={ruleModalVisible}
        onOk={handleSaveRule}
        onCancel={() => setRuleModalVisible(false)}
        confirmLoading={saving}
        okText="保存"
        cancelText="取消"
      >
        <Form form={ruleForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="规则名称" rules={[{ required: true, message: '请输入' }]}>
            <Input placeholder="规则名称" />
          </Form.Item>
          <Form.Item name="type" label="预警类型" rules={[{ required: true, message: '请选择' }]}>
            <Select placeholder="选择预警类型" options={Object.entries(alertTypeMap).map(([k, v]) => ({ value: k, label: v }))} />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input placeholder="规则描述" />
          </Form.Item>
          <Form.Item name="threshold" label="阈值">
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="unit" label="阈值单位">
            <Input placeholder="如: %, 天, 小时" />
          </Form.Item>
          <Form.Item name="enabled" label="启用" valuePropName="checked" initialValue={true}>
            <Switch checkedChildren="启用" unCheckedChildren="停用" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AlertPage;
