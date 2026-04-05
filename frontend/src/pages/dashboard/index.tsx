import React, { useState, useEffect } from 'react';
import { Card, Col, Row, Statistic, Table, Tag, Typography, Spin, Alert } from 'antd';
import {
  AppstoreOutlined,
  DatabaseOutlined,
  AlertOutlined,
  InboxOutlined,
  ArrowUpOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getDashboardData } from '../../api';
import type { DashboardData, AlertRecord, StockWarning } from '../../types';
import dayjs from 'dayjs';

const { Title } = Typography;

const DashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await getDashboardData();
      setData(res.data.data);
    } catch {
      // 使用模拟数据作为后备
      setData({
        totalComponents: 12580,
        totalStock: 834520,
        pendingAlerts: 23,
        todayInbound: 156,
        lowStockCount: 15,
        expiringCount: 8,
        recentAlerts: [
          { id: 1, type: 'LOW_STOCK', level: 'HIGH', internalPartNo: 'R-0402-10K', componentName: '电阻 10K 0402', title: '库存不足预警', message: '当前库存低于安全库存', status: 'PENDING', createTime: '2026-04-04 10:30:00' },
          { id: 2, type: 'EXPIRING', level: 'MEDIUM', internalPartNo: 'C-0603-100N', componentName: '电容 100nF 0603', title: '物料即将过期', message: '批次 B20240101 即将过期', status: 'PENDING', createTime: '2026-04-04 09:15:00' },
          { id: 3, type: 'MSD_EXPIRED', level: 'HIGH', internalPartNo: 'IC-OP07', componentName: '运算放大器 OP07', title: 'MSD暴露超时', message: 'MSD等级3，已暴露超过168小时', status: 'PENDING', createTime: '2026-04-04 08:45:00' },
          { id: 4, type: 'OVERSTOCK', level: 'LOW', internalPartNo: 'R-0805-1K', componentName: '电阻 1K 0805', title: '库存积压预警', message: '库存超过最大库存量200%', status: 'HANDLED', createTime: '2026-04-03 16:20:00' },
        ] as AlertRecord[],
        lowStockWarnings: [
          { componentId: 1, internalPartNo: 'R-0402-10K', componentName: '电阻 10K 0402', currentQty: 500, safetyStock: 2000, shortageQty: 1500 },
          { componentId: 2, internalPartNo: 'C-0603-100N', componentName: '电容 100nF 0603', currentQty: 200, safetyStock: 1000, shortageQty: 800 },
          { componentId: 3, internalPartNo: 'IC-STM32F103', componentName: 'STM32F103C8T6', currentQty: 50, safetyStock: 200, shortageQty: 150 },
          { componentId: 4, internalPartNo: 'L-0805-10UH', componentName: '电感 10uH 0805', currentQty: 0, safetyStock: 500, shortageQty: 500 },
        ] as StockWarning[],
      });
    } finally {
      setLoading(false);
    }
  };

  const alertLevelColor: Record<string, string> = {
    HIGH: 'red',
    MEDIUM: 'orange',
    LOW: 'blue',
  };

  const alertStatusColor: Record<string, string> = {
    PENDING: 'warning',
    HANDLED: 'success',
    IGNORED: 'default',
  };

  const alertColumns = [
    {
      title: '预警类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: string) => {
        const typeMap: Record<string, string> = {
          LOW_STOCK: '库存不足',
          EXPIRING: '即将过期',
          MSD_EXPIRED: 'MSD超时',
          OVERSTOCK: '库存积压',
        };
        return typeMap[type] || type;
      },
    },
    {
      title: '级别',
      dataIndex: 'level',
      key: 'level',
      width: 80,
      render: (level: string) => <Tag color={alertLevelColor[level]}>{level}</Tag>,
    },
    {
      title: '料号',
      dataIndex: 'internalPartNo',
      key: 'internalPartNo',
      width: 140,
    },
    {
      title: '元件名称',
      dataIndex: 'componentName',
      key: 'componentName',
      width: 160,
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) => <Tag color={alertStatusColor[status]}>{status === 'PENDING' ? '待处理' : status === 'HANDLED' ? '已处理' : '已忽略'}</Tag>,
    },
    {
      title: '时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 170,
      render: (t: string) => dayjs(t).format('YYYY-MM-DD HH:mm'),
    },
  ];

  const stockWarningColumns = [
    {
      title: '料号',
      dataIndex: 'internalPartNo',
      key: 'internalPartNo',
      width: 140,
    },
    {
      title: '元件名称',
      dataIndex: 'componentName',
      key: 'componentName',
      width: 160,
    },
    {
      title: '当前库存',
      dataIndex: 'currentQty',
      key: 'currentQty',
      width: 100,
      render: (qty: number) => <span style={{ color: qty === 0 ? '#ff4d4f' : '#faad14', fontWeight: 'bold' }}>{qty}</span>,
    },
    {
      title: '安全库存',
      dataIndex: 'safetyStock',
      key: 'safetyStock',
      width: 100,
    },
    {
      title: '缺口数量',
      dataIndex: 'shortageQty',
      key: 'shortageQty',
      width: 100,
      render: (qty: number) => <span style={{ color: '#ff4d4f' }}>{qty}</span>,
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_: unknown, record: StockWarning) => (
        <a onClick={() => navigate(`/components/${record.componentId}`)}>查看</a>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>工作台</Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="元件总数"
              value={data?.totalComponents || 0}
              prefix={<AppstoreOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="库存总量"
              value={data?.totalStock || 0}
              prefix={<DatabaseOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="待处理预警"
              value={data?.pendingAlerts || 0}
              prefix={<AlertOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="今日入库"
              value={data?.todayInbound || 0}
              prefix={<InboxOutlined />}
              suffix="件"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Alert
            message={
              data?.lowStockCount
                ? `当前有 ${data.lowStockCount} 种元件库存不足，${data.expiringCount} 批次即将过期`
                : '库存状态正常'
            }
            type={data?.lowStockCount ? 'warning' : 'success'}
            showIcon
            style={{ marginBottom: 16 }}
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card
            title="最近预警"
            extra={<a onClick={() => navigate('/alerts')}>查看全部</a>}
          >
            <Table
              columns={alertColumns}
              dataSource={data?.recentAlerts || []}
              rowKey="id"
              size="small"
              pagination={false}
            />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card
            title="库存不足预警"
            extra={<a onClick={() => navigate('/inventory/stocks')}>查看全部</a>}
          >
            <Table
              columns={stockWarningColumns}
              dataSource={data?.lowStockWarnings || []}
              rowKey="componentId"
              size="small"
              pagination={false}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
