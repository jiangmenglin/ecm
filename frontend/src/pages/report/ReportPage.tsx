import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Tabs, Table, Form, Row, Col, DatePicker, Select, Button, Statistic, Tag,
  Typography, Space, message, Input,
} from 'antd';
import {
  SearchOutlined, ExportOutlined,
} from '@ant-design/icons';
import {
  getTurnoverReport, getStaleReport, getOperationLogs,
} from '../../api';
import type { TurnoverReport, StaleReport, OperationLog } from '../../types';
import dayjs from 'dayjs';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const ReportPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);

  // 周转率
  const [turnoverData, setTurnoverData] = useState<TurnoverReport[]>([]);
  const [turnoverTotal, setTurnoverTotal] = useState(0);
  const [turnoverPage, setTurnoverPage] = useState(1);

  // 呆滞料
  const [staleData, setStaleData] = useState<StaleReport[]>([]);
  const [staleTotal, setStaleTotal] = useState(0);
  const [stalePage, setStalePage] = useState(1);

  // 操作日志
  const [logData, setLogData] = useState<OperationLog[]>([]);
  const [logTotal, setLogTotal] = useState(0);
  const [logPage, setLogPage] = useState(1);

  useEffect(() => {
    if (activeTab === 'turnover') fetchTurnover();
    if (activeTab === 'stale') fetchStale();
    if (activeTab === 'logs') fetchLogs();
  }, [activeTab, turnoverPage, stalePage, logPage]);

  const fetchTurnover = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getTurnoverReport({ page: turnoverPage, size: 20 });
      setTurnoverData(res.data.data.list || []);
      setTurnoverTotal(res.data.data.total || 0);
    } catch {
      setTurnoverData(Array.from({ length: 8 }, (_, i) => ({
        componentId: i + 1,
        internalPartNo: `R-0402-${(10 + i)}K`,
        componentName: `电阻 ${(10 + i)}K 0402`,
        categoryName: '电阻',
        totalInbound: 10000 + i * 2000,
        totalOutbound: 8000 + i * 1500,
        averageStock: 5000 + i * 500,
        turnoverRate: (3 + i * 0.5),
        turnoverDays: Math.round(365 / (3 + i * 0.5)),
      })));
      setTurnoverTotal(8);
    } finally {
      setLoading(false);
    }
  }, [turnoverPage]);

  const fetchStale = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getStaleReport({ page: stalePage, size: 20 });
      setStaleData(res.data.data.list || []);
      setStaleTotal(res.data.data.total || 0);
    } catch {
      setStaleData(Array.from({ length: 6 }, (_, i) => ({
        componentId: i + 1,
        internalPartNo: `C-0603-${(100 + i * 10)}N`,
        componentName: `电容 ${(100 + i * 10)}nF 0603`,
        categoryName: '电容',
        currentQty: 5000 + i * 1000,
        lastOutboundDate: dayjs().subtract(180 + i * 30, 'day').format('YYYY-MM-DD'),
        staleDays: 180 + i * 30,
        staleValue: (5000 + i * 1000) * (0.01 + i * 0.005),
      })));
      setStaleTotal(6);
    } finally {
      setLoading(false);
    }
  }, [stalePage]);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getOperationLogs({ page: logPage, size: 20 });
      setLogData(res.data.data.list || []);
      setLogTotal(res.data.data.total || 0);
    } catch {
      setLogData(Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        module: ['元件管理', '库存管理', '入库管理', '出库管理', '预警中心', '系统管理', '元件管理', '库存管理', '入库管理', '出库管理'][i],
        operation: ['创建元件', '库存盘点', '创建入库单', '创建出库单', '处理预警', '修改权限', '更新元件', '库存锁定', 'IQC检验', '审批出库'][i],
        operator: ['张三', '李四', '王五', '赵六', '张三', '管理员', '李四', '王五', '赵六', '张三'][i],
        target: [`R-0402-10K`, `WH01-A-01`, `IN202604001`, `OUT202604001`, `预警#23`, `用户角色`, `C-0603-100N`, `R-0402-10K 锁定`, `B20260401`, `OUT202604002`][i],
        detail: ['创建新元件 R-0402-10K', '盘点主仓库A区', '从YAGEO入库5000个', '生产领料100个', '处理低库存预警', '修改用户张三角色', '更新电容参数', '锁定100个库存', '检验合格', '审批通过'][i],
        ip: `192.168.1.${100 + i}`,
        createTime: dayjs().subtract(i * 2, 'hour').format('YYYY-MM-DD HH:mm:ss'),
      })));
      setLogTotal(10);
    } finally {
      setLoading(false);
    }
  }, [logPage]);

  const handleExport = () => {
    message.info('导出功能开发中...');
  };

  // 库存概览统计数据
  const overviewStats = [
    { title: '元件种类', value: 12580 },
    { title: '库存总量', value: 834520 },
    { title: '库存金额', value: 2856000, prefix: '¥' },
    { title: '本月入库', value: 156000 },
    { title: '本月出库', value: 132000 },
    { title: '库存周转率', value: 3.2, suffix: '次/年' },
    { title: '低库存预警', value: 23 },
    { title: '呆滞物料', value: 45 },
  ];

  const turnoverColumns = [
    { title: '料号', dataIndex: 'internalPartNo', key: 'internalPartNo', width: 140 },
    { title: '名称', dataIndex: 'componentName', key: 'componentName', width: 140 },
    { title: '分类', dataIndex: 'categoryName', key: 'categoryName', width: 80 },
    { title: '入库总量', dataIndex: 'totalInbound', key: 'totalInbound', width: 100 },
    { title: '出库总量', dataIndex: 'totalOutbound', key: 'totalOutbound', width: 100 },
    { title: '平均库存', dataIndex: 'averageStock', key: 'averageStock', width: 100 },
    {
      title: '周转率',
      dataIndex: 'turnoverRate',
      key: 'turnoverRate',
      width: 90,
      render: (v: number) => <span style={{ color: v < 2 ? '#ff4d4f' : v < 4 ? '#faad14' : '#52c41a' }}>{v.toFixed(2)}</span>,
    },
    {
      title: '周转天数',
      dataIndex: 'turnoverDays',
      key: 'turnoverDays',
      width: 90,
      render: (v: number) => <span style={{ color: v > 180 ? '#ff4d4f' : v > 90 ? '#faad14' : undefined }}>{v}</span>,
    },
  ];

  const staleColumns = [
    { title: '料号', dataIndex: 'internalPartNo', key: 'internalPartNo', width: 140 },
    { title: '名称', dataIndex: 'componentName', key: 'componentName', width: 140 },
    { title: '分类', dataIndex: 'categoryName', key: 'categoryName', width: 80 },
    { title: '当前库存', dataIndex: 'currentQty', key: 'currentQty', width: 100 },
    {
      title: '最后出库日',
      dataIndex: 'lastOutboundDate',
      key: 'lastOutboundDate',
      width: 120,
      render: (d: string) => d || '-',
    },
    {
      title: '呆滞天数',
      dataIndex: 'staleDays',
      key: 'staleDays',
      width: 100,
      render: (days: number) => {
        let color = '#52c41a';
        if (days > 360) color = '#ff4d4f';
        else if (days > 180) color = '#faad14';
        else if (days > 90) color = '#faad14';
        return <span style={{ color, fontWeight: 'bold' }}>{days}</span>;
      },
    },
    {
      title: '呆滞金额',
      dataIndex: 'staleValue',
      key: 'staleValue',
      width: 110,
      render: (v: number) => v ? `¥${v.toFixed(2)}` : '-',
    },
  ];

  const logColumns = [
    { title: '模块', dataIndex: 'module', key: 'module', width: 100 },
    { title: '操作', dataIndex: 'operation', key: 'operation', width: 100 },
    { title: '操作人', dataIndex: 'operator', key: 'operator', width: 80 },
    { title: '操作对象', dataIndex: 'target', key: 'target', width: 140 },
    { title: '详情', dataIndex: 'detail', key: 'detail', ellipsis: true },
    { title: 'IP地址', dataIndex: 'ip', key: 'ip', width: 130 },
    {
      title: '时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 170,
      render: (t: string) => t ? dayjs(t).format('YYYY-MM-DD HH:mm') : '-',
    },
  ];

  const tabItems = [
    {
      key: 'overview',
      label: '库存概览',
      children: (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <Button icon={<ExportOutlined />} onClick={handleExport}>导出报表</Button>
          </div>
          <Row gutter={[16, 16]}>
            {overviewStats.map((stat, i) => (
              <Col xs={12} sm={8} md={6} key={i}>
                <Card>
                  <Statistic
                    title={stat.title}
                    value={stat.value}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      ),
    },
    {
      key: 'turnover',
      label: '周转率分析',
      children: (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <Space>
              <RangePicker />
              <Select placeholder="选择分类" allowClear style={{ width: 150 }} />
              <Button type="primary" icon={<SearchOutlined />}>查询</Button>
            </Space>
            <Button icon={<ExportOutlined />} onClick={handleExport}>导出</Button>
          </div>
          <Table
            columns={turnoverColumns}
            dataSource={turnoverData}
            rowKey="componentId"
            loading={loading}
            pagination={{
              current: turnoverPage, pageSize: 20, total: turnoverTotal,
              showTotal: (t) => `共 ${t} 条`,
              onChange: (p) => setTurnoverPage(p),
            }}
          />
        </div>
      ),
    },
    {
      key: 'stale',
      label: '呆滞料分析',
      children: (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <Space>
              <Select placeholder="呆滞天数" allowClear style={{ width: 150 }}
                options={[
                  { value: 90, label: '> 90天' },
                  { value: 180, label: '> 180天' },
                  { value: 360, label: '> 360天' },
                ]}
              />
              <Select placeholder="选择分类" allowClear style={{ width: 150 }} />
              <Button type="primary" icon={<SearchOutlined />}>查询</Button>
            </Space>
            <Button icon={<ExportOutlined />} onClick={handleExport}>导出</Button>
          </div>
          <Table
            columns={staleColumns}
            dataSource={staleData}
            rowKey="componentId"
            loading={loading}
            pagination={{
              current: stalePage, pageSize: 20, total: staleTotal,
              showTotal: (t) => `共 ${t} 条`,
              onChange: (p) => setStalePage(p),
            }}
          />
        </div>
      ),
    },
    {
      key: 'logs',
      label: '操作日志',
      children: (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <Space>
              <RangePicker />
              <Select placeholder="操作模块" allowClear style={{ width: 150 }}
                options={[
                  { value: '元件管理', label: '元件管理' },
                  { value: '库存管理', label: '库存管理' },
                  { value: '入库管理', label: '入库管理' },
                  { value: '出库管理', label: '出库管理' },
                  { value: '预警中心', label: '预警中心' },
                  { value: '系统管理', label: '系统管理' },
                ]}
              />
              <Input placeholder="操作人" style={{ width: 120 }} />
              <Button type="primary" icon={<SearchOutlined />}>查询</Button>
            </Space>
            <Button icon={<ExportOutlined />} onClick={handleExport}>导出</Button>
          </div>
          <Table
            columns={logColumns}
            dataSource={logData}
            rowKey="id"
            loading={loading}
            pagination={{
              current: logPage, pageSize: 20, total: logTotal,
              showTotal: (t) => `共 ${t} 条`,
              onChange: (p) => setLogPage(p),
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>报表分析</Title>
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      </Card>
    </div>
  );
};

export default ReportPage;
