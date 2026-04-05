import React, { useState, useEffect, useCallback } from 'react';
import {
  Table, Card, Select, Row, Col, Button, Tag, Space, Input, Typography, Tabs, Form,
  Radio, InputNumber, Modal, message,
} from 'antd';
import {
  SearchOutlined, ReloadOutlined, CheckCircleOutlined, CloseCircleOutlined,
} from '@ant-design/icons';
import { getIqcRecords, submitIqc } from '../../api';
import type { IqcRecord } from '../../types';
import dayjs from 'dayjs';

const { Title } = Typography;

const inspectionResultMap: Record<string, { label: string; color: string }> = {
  PASS: { label: '合格', color: 'green' },
  FAIL: { label: '不合格', color: 'red' },
  CONDITIONAL: { label: '有条件接收', color: 'orange' },
};

const dispositionMap: Record<string, string> = {
  ACCEPT: '接收',
  RETURN: '退货',
  SCRAP: '报废',
  SORT: '挑选',
  REWORK: '返工',
};

const IqcPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<IqcRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [activeTab, setActiveTab] = useState('pending');
  const [inspectModalVisible, setInspectModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<IqcRecord | null>(null);
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, [page, size, activeTab]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getIqcRecords({ page, size, status: activeTab === 'pending' ? 'PENDING' : 'COMPLETED' });
      const result = res.data.data;
      setData(result.list || []);
      setTotal(result.total || 0);
    } catch {
      const mockPending: IqcRecord[] = Array.from({ length: 5 }, (_, i) => ({
        id: i + 1,
        inboundOrderId: i + 1,
        inboundOrderNo: `IN202604${String(i + 1).padStart(3, '0')}`,
        componentId: i + 1,
        internalPartNo: `R-0402-${(10 + i)}K`,
        componentName: `电阻 ${(10 + i)}K 0402`,
        batchNo: `B202604${String(i + 1).padStart(2, '0')}`,
        supplierBatchNo: `SUP-${1000 + i}`,
        inspectionType: i < 3 ? 'NORMAL' : 'STRICT',
        sampleQty: 50 + i * 10,
        acceptQty: 0,
        rejectQty: 0,
        appearanceResult: '',
        functionResult: '',
        pinOxidationResult: '',
        dimensionResult: '',
        overallResult: '',
        disposition: '',
        inspector: '',
        inspectTime: '',
        notes: '',
      }));
      const mockCompleted: IqcRecord[] = Array.from({ length: 5 }, (_, i) => ({
        id: 10 + i + 1,
        inboundOrderId: 10 + i + 1,
        inboundOrderNo: `IN202603${String(i + 1).padStart(3, '0')}`,
        componentId: 10 + i + 1,
        internalPartNo: `C-0603-${(100 + i * 10)}N`,
        componentName: `电容 ${(100 + i * 10)}nF 0603`,
        batchNo: `B202603${String(i + 1).padStart(2, '0')}`,
        supplierBatchNo: `SUP-${2000 + i}`,
        inspectionType: 'NORMAL',
        sampleQty: 50,
        acceptQty: 50 - i,
        rejectQty: i,
        appearanceResult: i < 3 ? 'PASS' : 'FAIL',
        functionResult: 'PASS',
        pinOxidationResult: 'PASS',
        dimensionResult: i < 4 ? 'PASS' : 'FAIL',
        overallResult: i < 3 ? 'PASS' : 'FAIL',
        disposition: i < 3 ? 'ACCEPT' : 'RETURN',
        inspector: ['张三', '李四', '王五', '赵六', '张三'][i],
        inspectTime: dayjs().subtract(i * 24, 'hour').format('YYYY-MM-DD HH:mm:ss'),
        notes: i >= 3 ? `不合格，${i}个样品不合格` : '',
      }));
      setData(activeTab === 'pending' ? mockPending : mockCompleted);
      setTotal(activeTab === 'pending' ? 5 : 5);
    } finally {
      setLoading(false);
    }
  }, [page, size, activeTab]);

  const handleInspect = (record: IqcRecord) => {
    setSelectedRecord(record);
    form.resetFields();
    setInspectModalVisible(true);
  };

  const handleSubmitIqc = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      await submitIqc({
        ...values,
        inboundOrderId: selectedRecord?.inboundOrderId,
        componentId: selectedRecord?.componentId,
        batchNo: selectedRecord?.batchNo,
      });
      message.success('检验结果提交成功');
      setInspectModalVisible(false);
      fetchData();
    } catch (err: unknown) {
      if (err instanceof Error) message.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const pendingColumns = [
    { title: '入库单号', dataIndex: 'inboundOrderNo', key: 'inboundOrderNo', width: 150 },
    { title: '料号', dataIndex: 'internalPartNo', key: 'internalPartNo', width: 140 },
    { title: '元件名称', dataIndex: 'componentName', key: 'componentName', width: 140 },
    { title: '批次号', dataIndex: 'batchNo', key: 'batchNo', width: 130 },
    { title: '供应商批次', dataIndex: 'supplierBatchNo', key: 'supplierBatchNo', width: 120 },
    {
      title: '检验类型',
      dataIndex: 'inspectionType',
      key: 'inspectionType',
      width: 100,
      render: (type: string) => type === 'STRICT' ? <Tag color="red">加严</Tag> : <Tag color="blue">正常</Tag>,
    },
    { title: '抽样数量', dataIndex: 'sampleQty', key: 'sampleQty', width: 100 },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: unknown, record: IqcRecord) => (
        <Button type="primary" size="small" onClick={() => handleInspect(record)}>
          开始检验
        </Button>
      ),
    },
  ];

  const completedColumns = [
    { title: '入库单号', dataIndex: 'inboundOrderNo', key: 'inboundOrderNo', width: 150 },
    { title: '料号', dataIndex: 'internalPartNo', key: 'internalPartNo', width: 140 },
    { title: '元件名称', dataIndex: 'componentName', key: 'componentName', width: 140 },
    { title: '批次号', dataIndex: 'batchNo', key: 'batchNo', width: 130 },
    { title: '抽样数', dataIndex: 'sampleQty', key: 'sampleQty', width: 80 },
    { title: '合格数', dataIndex: 'acceptQty', key: 'acceptQty', width: 80 },
    { title: '不合格数', dataIndex: 'rejectQty', key: 'rejectQty', width: 90 },
    {
      title: '外观',
      dataIndex: 'appearanceResult',
      key: 'appearanceResult',
      width: 80,
      render: (r: string) => {
        const info = inspectionResultMap[r];
        return info ? <Tag color={info.color}>{info.label}</Tag> : '-';
      },
    },
    {
      title: '功能',
      dataIndex: 'functionResult',
      key: 'functionResult',
      width: 80,
      render: (r: string) => {
        const info = inspectionResultMap[r];
        return info ? <Tag color={info.color}>{info.label}</Tag> : '-';
      },
    },
    {
      title: '引脚氧化',
      dataIndex: 'pinOxidationResult',
      key: 'pinOxidationResult',
      width: 90,
      render: (r: string) => {
        const info = inspectionResultMap[r];
        return info ? <Tag color={info.color}>{info.label}</Tag> : '-';
      },
    },
    {
      title: '尺寸',
      dataIndex: 'dimensionResult',
      key: 'dimensionResult',
      width: 80,
      render: (r: string) => {
        const info = inspectionResultMap[r];
        return info ? <Tag color={info.color}>{info.label}</Tag> : '-';
      },
    },
    {
      title: '综合结果',
      dataIndex: 'overallResult',
      key: 'overallResult',
      width: 100,
      render: (r: string) => {
        const info = inspectionResultMap[r];
        return info ? <Tag color={info.color} style={{ fontWeight: 'bold' }}>{info.label}</Tag> : '-';
      },
    },
    {
      title: '处置',
      dataIndex: 'disposition',
      key: 'disposition',
      width: 80,
      render: (d: string) => dispositionMap[d] || '-',
    },
    { title: '检验员', dataIndex: 'inspector', key: 'inspector', width: 80 },
    {
      title: '检验时间',
      dataIndex: 'inspectTime',
      key: 'inspectTime',
      width: 170,
      render: (t: string) => t ? dayjs(t).format('YYYY-MM-DD HH:mm') : '-',
    },
  ];

  const tabItems = [
    {
      key: 'pending',
      label: `待检验`,
      children: (
        <Table
          columns={pendingColumns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page, pageSize: size, total,
            showTotal: (t) => `共 ${t} 条`,
            onChange: (p, s) => { setPage(p); setSize(s); },
          }}
        />
      ),
    },
    {
      key: 'completed',
      label: '检验历史',
      children: (
        <Table
          columns={completedColumns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1700 }}
          pagination={{
            current: page, pageSize: size, total,
            showTotal: (t) => `共 ${t} 条`,
            onChange: (p, s) => { setPage(p); setSize(s); },
          }}
        />
      ),
    },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>IQC检验</Title>
      <Card>
        <Tabs activeKey={activeTab} onChange={(key) => { setActiveTab(key); setPage(1); }} items={tabItems} />
      </Card>

      <Modal
        title={`IQC检验 - ${selectedRecord?.internalPartNo || ''}`}
        open={inspectModalVisible}
        onOk={handleSubmitIqc}
        onCancel={() => setInspectModalVisible(false)}
        confirmLoading={saving}
        width={700}
        okText="提交检验"
        cancelText="取消"
      >
        {selectedRecord && (
          <div style={{ marginBottom: 16, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
            <Row gutter={16}>
              <Col span={8}><strong>入库单:</strong> {selectedRecord.inboundOrderNo}</Col>
              <Col span={8}><strong>批次号:</strong> {selectedRecord.batchNo}</Col>
              <Col span={8}><strong>抽样数:</strong> {selectedRecord.sampleQty}</Col>
            </Row>
          </div>
        )}
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="acceptQty" label="合格数量" rules={[{ required: true, message: '请输入合格数量' }]}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="rejectQty" label="不合格数量" rules={[{ required: true, message: '请输入不合格数量' }]}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="appearanceResult" label="外观检验" rules={[{ required: true, message: '请选择' }]}>
                <Radio.Group>
                  <Radio.Button value="PASS"><CheckCircleOutlined /> 合格</Radio.Button>
                  <Radio.Button value="FAIL"><CloseCircleOutlined /> 不合格</Radio.Button>
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="functionResult" label="功能检验" rules={[{ required: true, message: '请选择' }]}>
                <Radio.Group>
                  <Radio.Button value="PASS"><CheckCircleOutlined /> 合格</Radio.Button>
                  <Radio.Button value="FAIL"><CloseCircleOutlined /> 不合格</Radio.Button>
                </Radio.Group>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="pinOxidationResult" label="引脚氧化" rules={[{ required: true, message: '请选择' }]}>
                <Radio.Group>
                  <Radio.Button value="PASS"><CheckCircleOutlined /> 合格</Radio.Button>
                  <Radio.Button value="FAIL"><CloseCircleOutlined /> 不合格</Radio.Button>
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="dimensionResult" label="尺寸检验" rules={[{ required: true, message: '请选择' }]}>
                <Radio.Group>
                  <Radio.Button value="PASS"><CheckCircleOutlined /> 合格</Radio.Button>
                  <Radio.Button value="FAIL"><CloseCircleOutlined /> 不合格</Radio.Button>
                </Radio.Group>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="overallResult" label="综合判定" rules={[{ required: true, message: '请选择' }]}>
                <Radio.Group>
                  <Radio.Button value="PASS"><CheckCircleOutlined style={{ color: '#52c41a' }} /> 合格</Radio.Button>
                  <Radio.Button value="FAIL"><CloseCircleOutlined style={{ color: '#ff4d4f' }} /> 不合格</Radio.Button>
                  <Radio.Button value="CONDITIONAL">有条件接收</Radio.Button>
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="disposition" label="处置方式" rules={[{ required: true, message: '请选择' }]}>
                <Select placeholder="选择处置方式">
                  {Object.entries(dispositionMap).map(([k, v]) => (
                    <Select.Option key={k} value={k}>{v}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="notes" label="备注">
            <Input.TextArea rows={3} placeholder="检验备注" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default IqcPage;
