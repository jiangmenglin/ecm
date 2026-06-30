import React, { useState, useEffect } from 'react';
import {
  Descriptions, Tabs, Table, Tag, Card, Spin, Button, Typography, Space, Popconfirm, message,
} from 'antd';
import {
  ArrowLeftOutlined, EditOutlined, DeleteOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { getComponent, deleteComponent } from '../../api';
import type { Component, Parameter, Substitute } from '../../types';
import dayjs from 'dayjs';

const { Title } = Typography;

const lifecycleStatusMap: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: '活跃', color: 'green' },
  NRND: { label: '不推荐新设计', color: 'orange' },
  EOL: { label: '即将停产', color: 'red' },
  OBSOLETE: { label: '已停产', color: 'default' },
};

const ComponentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [component, setComponent] = useState<Component | null>(null);

  useEffect(() => {
    fetchComponent();
  }, [id]);

  const fetchComponent = async () => {
    setLoading(true);
    try {
      const res = await getComponent(Number(id));
      setComponent(res.data.data);
    } catch {
      // 模拟数据
      setComponent({
        id: Number(id),
        internalPartNo: 'R-0402-10K',
        manufacturerPartNo: 'RC0402FR-0710KL',
        name: '电阻 10K 0402',
        nameEn: 'Resistor 10K 0402',
        categoryId: 1,
        categoryName: '贴片电阻',
        manufacturer: 'YAGEO',
        packageType: '0402',
        packageStandard: 'IPC-SM-782',
        lifecycleStatus: 'ACTIVE',
        description: '贴片电阻，阻值10K，精度1%，0402封装',
        msdLevel: '1',
        esdSensitive: false,
        operatingTempMin: -55,
        operatingTempMax: 125,
        storageTempMin: -40,
        storageTempMax: 85,
        unit: '个',
        defaultLeadTime: 14,
        minimumOrderQty: 5000,
        createTime: '2026-01-15 10:30:00',
        updateTime: '2026-03-20 14:22:00',
        parameters: [
          { id: 1, name: '阻值', value: '10K', unit: 'Ohm' },
          { id: 2, name: '精度', value: '1', unit: '%' },
          { id: 3, name: '额定功率', value: '0.063', unit: 'W' },
          { id: 4, name: '最大工作电压', value: '50', unit: 'V' },
          { id: 5, name: '温度系数', value: '100', unit: 'ppm/°C' },
          { id: 6, name: '材质', value: '厚膜', unit: '' },
        ] as Parameter[],
        substitutes: [
          { id: 1, substituteComponentId: 101, substitutePartNo: 'RC0402FR-0710KLB', substituteName: '电阻 10K 0402 (替代)', matchLevel: 'HIGH', notes: '完全替代' },
          { id: 2, substituteComponentId: 102, substitutePartNo: 'CR0402-10K', substituteName: '电阻 10K 0402 (国巨)', matchLevel: 'MEDIUM', notes: '参数接近' },
        ] as Substitute[],
        stockSummary: {
          totalQty: 5000,
          availableQty: 4000,
          lockedQty: 1000,
          safetyStock: 2000,
          stockStatus: 'NORMAL',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteComponent(Number(id));
      message.success('删除成功');
      navigate('/components');
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : '删除失败');
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '100px 0' }}><Spin size="large" /></div>;
  }

  if (!component) {
    return <div>元件不存在</div>;
  }

  const paramColumns = [
    { title: '参数名', dataIndex: 'name', key: 'name', width: 150 },
    { title: '参数值', dataIndex: 'value', key: 'value', width: 150 },
    { title: '单位', dataIndex: 'unit', key: 'unit', width: 100 },
    { title: '说明', dataIndex: 'description', key: 'description' },
  ];

  const substituteColumns = [
    { title: '替代料号', dataIndex: 'substitutePartNo', key: 'substitutePartNo', width: 200 },
    { title: '名称', dataIndex: 'substituteName', key: 'substituteName', width: 200 },
    {
      title: '匹配等级',
      dataIndex: 'matchLevel',
      key: 'matchLevel',
      width: 120,
      render: (level: string) => {
        const map: Record<string, { color: string; label: string }> = {
          HIGH: { color: 'green', label: '高' },
          MEDIUM: { color: 'orange', label: '中' },
          LOW: { color: 'red', label: '低' },
        };
        const info = map[level] || { color: 'default', label: level };
        return <Tag color={info.color}>{info.label}</Tag>;
      },
    },
    { title: '备注', dataIndex: 'notes', key: 'notes' },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_: unknown, record: Substitute) => (
        <a onClick={() => navigate(`/components/${record.substituteComponentId}`)}>查看</a>
      ),
    },
  ];

  const tabItems = [
    {
      key: 'basic',
      label: '基本信息',
      children: (
        <Descriptions bordered column={{ xs: 1, sm: 2, lg: 3 }}>
          <Descriptions.Item label="内部料号">{component.internalPartNo}</Descriptions.Item>
          <Descriptions.Item label="制造商料号">{component.manufacturerPartNo}</Descriptions.Item>
          <Descriptions.Item label="名称">{component.name}</Descriptions.Item>
          <Descriptions.Item label="英文名称">{component.nameEn || '-'}</Descriptions.Item>
          <Descriptions.Item label="分类">{component.categoryName}</Descriptions.Item>
          <Descriptions.Item label="制造商">{component.manufacturer || '-'}</Descriptions.Item>
          <Descriptions.Item label="封装类型">{component.packageType || '-'}</Descriptions.Item>
          <Descriptions.Item label="封装标准">{component.packageStandard || '-'}</Descriptions.Item>
          <Descriptions.Item label="生命周期">
            {(() => {
              const info = lifecycleStatusMap[component.lifecycleStatus];
              return info ? <Tag color={info.color}>{info.label}</Tag> : component.lifecycleStatus;
            })()}
          </Descriptions.Item>
          <Descriptions.Item label="MSD等级">{component.msdLevel || '-'}</Descriptions.Item>
          <Descriptions.Item label="ESD敏感">{component.esdSensitive ? '是' : '否'}</Descriptions.Item>
          <Descriptions.Item label="ESD等级">{component.esdClass || '-'}</Descriptions.Item>
          <Descriptions.Item label="工作温度范围">
            {component.operatingTempMin != null && component.operatingTempMax != null
              ? `${component.operatingTempMin}°C ~ ${component.operatingTempMax}°C`
              : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="存储温度范围">
            {component.storageTempMin != null && component.storageTempMax != null
              ? `${component.storageTempMin}°C ~ ${component.storageTempMax}°C`
              : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="单位">{component.unit || '-'}</Descriptions.Item>
          <Descriptions.Item label="默认交期">{component.defaultLeadTime ? `${component.defaultLeadTime} 天` : '-'}</Descriptions.Item>
          <Descriptions.Item label="最小订购量">{component.minimumOrderQty || '-'}</Descriptions.Item>
          <Descriptions.Item label="描述" span={3}>{component.description || '-'}</Descriptions.Item>
          <Descriptions.Item label="数据手册">
            {component.datasheetUrl ? <a href={component.datasheetUrl} target="_blank" rel="noreferrer">查看</a> : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">{dayjs(component.createTime).format('YYYY-MM-DD HH:mm')}</Descriptions.Item>
          <Descriptions.Item label="更新时间">{dayjs(component.updateTime).format('YYYY-MM-DD HH:mm')}</Descriptions.Item>
        </Descriptions>
      ),
    },
    {
      key: 'params',
      label: '参数列表',
      children: (
        <Table
          columns={paramColumns}
          dataSource={component.parameters || []}
          rowKey={(r) => r.name}
          pagination={false}
          size="small"
        />
      ),
    },
    {
      key: 'substitutes',
      label: '替代料',
      children: (
        <Table
          columns={substituteColumns}
          dataSource={component.substitutes || []}
          rowKey="id"
          pagination={false}
          size="small"
        />
      ),
    },
    {
      key: 'stock',
      label: '库存信息',
      children: (
        <Card>
          <Descriptions bordered column={{ xs: 1, sm: 2, lg: 4 }}>
            <Descriptions.Item label="总库存">{component.stockSummary?.totalQty ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="可用数量">{component.stockSummary?.availableQty ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="锁定数量">{component.stockSummary?.lockedQty ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="安全库存">{component.stockSummary?.safetyStock ?? '-'}</Descriptions.Item>
          </Descriptions>
        </Card>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/components')}>返回</Button>
          <Title level={4} style={{ margin: 0 }}>
            元件详情 - {component.internalPartNo}
          </Title>
        </Space>
        <Space>
          <Button icon={<EditOutlined />} onClick={() => navigate(`/components/${id}/edit`)}>编辑</Button>
          <Popconfirm title="确定要删除此元件吗？" onConfirm={handleDelete} okText="确定" cancelText="取消">
            <Button danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      </div>

      <Card>
        <Tabs items={tabItems} />
      </Card>
    </div>
  );
};

export default ComponentDetailPage;
