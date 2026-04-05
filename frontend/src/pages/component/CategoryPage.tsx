import React, { useState, useEffect } from 'react';
import {
  Tree, Card, Button, Modal, Form, Input, Space, message, Typography, Empty,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, FolderAddOutlined,
} from '@ant-design/icons';
import type { TreeProps } from 'antd';
import { getCategoryTree, createCategory, updateCategory, deleteCategory } from '../../api';
import type { Category } from '../../types';

const { Title } = Typography;
const { TextArea } = Input;

const CategoryPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [treeData, setTreeData] = useState<Category[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [selectedParentId, setSelectedParentId] = useState<number | null>(null);
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await getCategoryTree();
      setTreeData(res.data.data || []);
    } catch {
      // 模拟数据
      setTreeData([
        {
          id: 1, name: '电阻', parentId: null, code: 'R', sortOrder: 1,
          children: [
            { id: 11, name: '贴片电阻', parentId: 1, code: 'R-SMD', sortOrder: 1 },
            { id: 12, name: '插件电阻', parentId: 1, code: 'R-TH', sortOrder: 2 },
            { id: 13, name: '排阻', parentId: 1, code: 'R-ARR', sortOrder: 3 },
          ],
        },
        {
          id: 2, name: '电容', parentId: null, code: 'C', sortOrder: 2,
          children: [
            { id: 21, name: '陶瓷电容', parentId: 2, code: 'C-MLCC', sortOrder: 1 },
            { id: 22, name: '电解电容', parentId: 2, code: 'C-EC', sortOrder: 2 },
            { id: 23, name: '钽电容', parentId: 2, code: 'C-TANT', sortOrder: 3 },
          ],
        },
        {
          id: 3, name: '电感', parentId: null, code: 'L', sortOrder: 3,
          children: [
            { id: 31, name: '贴片电感', parentId: 3, code: 'L-SMD', sortOrder: 1 },
            { id: 32, name: '功率电感', parentId: 3, code: 'L-PWR', sortOrder: 2 },
          ],
        },
        { id: 4, name: '集成电路', parentId: null, code: 'IC', sortOrder: 4, children: [] },
        { id: 5, name: '连接器', parentId: null, code: 'CN', sortOrder: 5, children: [] },
        { id: 6, name: '二极管', parentId: null, code: 'D', sortOrder: 6, children: [] },
        { id: 7, name: '晶体管', parentId: null, code: 'Q', sortOrder: 7, children: [] },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const buildAntTreeData = (categories: Category[]): TreeProps['treeData'] =>
    categories.map((cat) => ({
      key: cat.id,
      title: (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>{cat.name}</span>
          <span style={{ color: '#999', fontSize: 12 }}>({cat.code})</span>
          <Space size={4}>
            <Button
              type="link"
              size="small"
              icon={<PlusOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleAddChild(cat.id);
              }}
            />
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(cat);
              }}
            />
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(cat);
              }}
            />
          </Space>
        </div>
      ),
      children: cat.children ? buildAntTreeData(cat.children) : [],
    }));

  const handleAddRoot = () => {
    setEditingCategory(null);
    setSelectedParentId(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleAddChild = (parentId: number) => {
    setEditingCategory(null);
    setSelectedParentId(parentId);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setSelectedParentId(category.parentId);
    form.setFieldsValue({
      name: category.name,
      code: category.code,
      description: category.description,
      sortOrder: category.sortOrder,
    });
    setModalVisible(true);
  };

  const handleDelete = async (category: Category) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除分类"${category.name}"吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteCategory(category.id);
          message.success('删除成功');
          fetchCategories();
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
      if (editingCategory) {
        await updateCategory(editingCategory.id, { ...values, parentId: selectedParentId });
        message.success('更新成功');
      } else {
        await createCategory({ ...values, parentId: selectedParentId });
        message.success('创建成功');
      }
      setModalVisible(false);
      fetchCategories();
    } catch (err: unknown) {
      if (err instanceof Error) {
        message.error(err.message);
      }
    } finally {
      setSaving(false);
    }
  };

  const getCategoryName = (cats: Category[], id: number | null): string => {
    if (id === null) return '无（顶级分类）';
    for (const cat of cats) {
      if (cat.id === id) return cat.name;
      if (cat.children) {
        const found = getCategoryName(cat.children, id);
        if (found !== '') return found;
      }
    }
    return '';
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>分类管理</Title>
        <Button type="primary" icon={<FolderAddOutlined />} onClick={handleAddRoot}>
          新增根分类
        </Button>
      </div>

      <Card loading={loading}>
        {treeData.length === 0 ? (
          <Empty description="暂无分类数据" />
        ) : (
          <Tree
            treeData={buildAntTreeData(treeData)}
            defaultExpandAll
            showLine
            showIcon={false}
          />
        )}
      </Card>

      <Modal
        title={editingCategory ? '编辑分类' : `新增分类${selectedParentId ? ` - 父级: ${getCategoryName(treeData, selectedParentId)}` : ''}`}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        confirmLoading={saving}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="name"
            label="分类名称"
            rules={[{ required: true, message: '请输入分类名称' }]}
          >
            <Input placeholder="分类名称" />
          </Form.Item>
          <Form.Item
            name="code"
            label="分类编码"
            rules={[{ required: true, message: '请输入分类编码' }]}
          >
            <Input placeholder="分类编码，如 R, C, IC" />
          </Form.Item>
          <Form.Item name="sortOrder" label="排序号" initialValue={0}>
            <Input type="number" placeholder="排序号" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <TextArea rows={3} placeholder="分类描述" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CategoryPage;
