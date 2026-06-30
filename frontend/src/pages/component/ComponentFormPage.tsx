import React, { useState, useEffect } from 'react';
import {
  Form, Input, Select, TreeSelect, InputNumber, Button, Card, Space, Switch, message, Typography,
  Row, Col, Divider,
} from 'antd';
import {
  ArrowLeftOutlined, MinusCircleOutlined, PlusOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { getComponent, createComponent, updateComponent, getCategoryTree } from '../../api';
import type { Category } from '../../types';

const { Title } = Typography;
const { TextArea } = Input;

const lifecycleOptions = [
  { value: 'ACTIVE', label: '活跃' },
  { value: 'NRND', label: '不推荐新设计' },
  { value: 'EOL', label: '即将停产' },
  { value: 'OBSOLETE', label: '已停产' },
];

const msdLevelOptions = [
  { value: '1', label: '等级1 - 无限' },
  { value: '2', label: '等级2 - 1年' },
  { value: '2a', label: '等级2a - 4周' },
  { value: '3', label: '等级3 - 168小时' },
  { value: '4', label: '等级4 - 72小时' },
  { value: '5', label: '等级5 - 48小时' },
  { value: '5a', label: '等级5a - 24小时' },
  { value: '6', label: '等级6 - 必须烘烤' },
];

const ComponentFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const isEdit = !!id;

  useEffect(() => {
    fetchCategories();
    if (isEdit) {
      fetchComponent();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const res = await getCategoryTree();
      setCategories(res.data.data || []);
    } catch {
      // ignore
    }
  };

  const fetchComponent = async () => {
    setLoading(true);
    try {
      const res = await getComponent(Number(id));
      const comp = res.data.data;
      form.setFieldsValue({
        ...comp,
        parameters: comp.parameters?.map((p) => ({ name: p.name, value: p.value, unit: p.unit, description: p.description })),
      });
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const buildCategoryTreeData = (cats: Category[]): any =>
    cats.map((cat) => ({
      title: cat.name,
      value: cat.id,
      key: cat.id,
      children: cat.children ? buildCategoryTreeData(cat.children) : undefined,
    }));

  const onFinish = async (values: Record<string, unknown>) => {
    setSaving(true);
    try {
      if (isEdit) {
        await updateComponent(Number(id), values);
        message.success('更新成功');
      } else {
        await createComponent(values);
        message.success('创建成功');
      }
      navigate('/components');
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : '操作失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/components')}>返回</Button>
          <Title level={4} style={{ margin: 0 }}>
            {isEdit ? '编辑元件' : '新增元件'}
          </Title>
        </Space>
      </div>

      <Card loading={loading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            lifecycleStatus: 'ACTIVE',
            unit: '个',
            esdSensitive: false,
          }}
        >
          <Divider orientation="left">基本信息</Divider>
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                name="internalPartNo"
                label="内部料号"
                rules={[{ required: true, message: '请输入内部料号' }]}
              >
                <Input placeholder="例如: R-0402-10K" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="manufacturerPartNo"
                label="制造商料号"
                rules={[{ required: true, message: '请输入制造商料号' }]}
              >
                <Input placeholder="例如: RC0402FR-0710KL" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="name"
                label="名称"
                rules={[{ required: true, message: '请输入名称' }]}
              >
                <Input placeholder="例如: 电阻 10K 0402" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="nameEn" label="英文名称">
                <Input placeholder="英文名称" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="categoryId"
                label="分类"
                rules={[{ required: true, message: '请选择分类' }]}
              >
                <TreeSelect
                  placeholder="选择分类"
                  treeData={buildCategoryTreeData(categories)}
                  treeDefaultExpandAll
                  showSearch
                  treeNodeFilterProp="title"
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="manufacturer" label="制造商">
                <Input placeholder="制造商" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="packageType" label="封装类型">
                <Input placeholder="例如: 0402, 0603, QFP-48" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="packageStandard" label="封装标准">
                <Input placeholder="封装标准" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="lifecycleStatus"
                label="生命周期状态"
                rules={[{ required: true }]}
              >
                <Select options={lifecycleOptions} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="unit" label="单位">
                <Select
                  options={[
                    { value: '个', label: '个' },
                    { value: '只', label: '只' },
                    { value: '片', label: '片' },
                    { value: '卷', label: '卷' },
                    { value: '盘', label: '盘' },
                    { value: '箱', label: '箱' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="defaultLeadTime" label="默认交期（天）">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="minimumOrderQty" label="最小订购量">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label="描述">
            <TextArea rows={3} placeholder="元件描述" />
          </Form.Item>
          <Form.Item name="datasheetUrl" label="数据手册URL">
            <Input placeholder="https://..." />
          </Form.Item>

          <Divider orientation="left">环境参数</Divider>
          <Row gutter={16}>
            <Col xs={24} md={6}>
              <Form.Item name="msdLevel" label="MSD等级">
                <Select options={msdLevelOptions} allowClear placeholder="选择MSD等级" />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item name="esdSensitive" label="ESD敏感" valuePropName="checked">
                <Switch checkedChildren="是" unCheckedChildren="否" />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item name="esdClass" label="ESD等级">
                <Select allowClear placeholder="ESD等级">
                  {['0', '1', '2', '3', '4'].map((v) => (
                    <Select.Option key={v} value={v}>等级 {v}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} md={6}>
              <Form.Item name="operatingTempMin" label="最低工作温度(°C)">
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item name="operatingTempMax" label="最高工作温度(°C)">
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item name="storageTempMin" label="最低存储温度(°C)">
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item name="storageTempMax" label="最高存储温度(°C)">
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">参数列表</Divider>
          <Form.List name="parameters">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Row key={key} gutter={16} align="middle">
                    <Col span={5}>
                      <Form.Item {...restField} name={[name, 'name']} rules={[{ required: true, message: '请输入参数名' }]}>
                        <Input placeholder="参数名" />
                      </Form.Item>
                    </Col>
                    <Col span={5}>
                      <Form.Item {...restField} name={[name, 'value']} rules={[{ required: true, message: '请输入参数值' }]}>
                        <Input placeholder="参数值" />
                      </Form.Item>
                    </Col>
                    <Col span={3}>
                      <Form.Item {...restField} name={[name, 'unit']}>
                        <Input placeholder="单位" />
                      </Form.Item>
                    </Col>
                    <Col span={7}>
                      <Form.Item {...restField} name={[name, 'description']}>
                        <Input placeholder="说明" />
                      </Form.Item>
                    </Col>
                    <Col span={2}>
                      <MinusCircleOutlined
                        onClick={() => remove(name)}
                        style={{ color: '#ff4d4f', fontSize: 18 }}
                      />
                    </Col>
                  </Row>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    添加参数
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={saving}>
                {isEdit ? '更新' : '创建'}
              </Button>
              <Button onClick={() => navigate('/components')}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ComponentFormPage;
