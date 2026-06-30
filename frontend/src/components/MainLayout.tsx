import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown, Typography, theme } from 'antd';
import type { MenuProps } from 'antd';
import {
  DashboardOutlined,
  AppstoreOutlined,
  FolderOutlined,
  DatabaseOutlined,
  ShoppingOutlined,
  ExportOutlined,
  AlertOutlined,
  BarChartOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  InboxOutlined,
  BarcodeOutlined,
  LockOutlined,
  FileAddOutlined,
  FileSearchOutlined,
  TeamOutlined,
  BuildOutlined,
  ContainerOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../store/auth';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

type MenuItem = Required<MenuProps>['items'][number];

const menuItems: MenuItem[] = [
  {
    key: '/dashboard',
    icon: <DashboardOutlined />,
    label: '仪表盘',
  },
  {
    key: 'component-group',
    icon: <AppstoreOutlined />,
    label: '元件管理',
    children: [
      {
        key: '/components',
        icon: <BarcodeOutlined />,
        label: '元件列表',
      },
      {
        key: '/categories',
        icon: <FolderOutlined />,
        label: '分类管理',
      },
    ],
  },
  {
    key: 'inventory-group',
    icon: <DatabaseOutlined />,
    label: '库存管理',
    children: [
      {
        key: '/inventory/stocks',
        icon: <InboxOutlined />,
        label: '库存查询',
      },
      {
        key: '/inventory/batches',
        icon: <ContainerOutlined />,
        label: '批次管理',
      },
      {
        key: '/inventory/warehouses',
        icon: <BuildOutlined />,
        label: '仓库管理',
      },
      {
        key: '/inventory/locks',
        icon: <LockOutlined />,
        label: '库存锁定',
      },
    ],
  },
  {
    key: 'inbound-group',
    icon: <ShoppingOutlined />,
    label: '入库管理',
    children: [
      {
        key: '/inbound/purchase-orders',
        icon: <FileAddOutlined />,
        label: '采购订单',
      },
      {
        key: '/inbound/orders',
        icon: <InboxOutlined />,
        label: '入库单',
      },
      {
        key: '/inbound/iqc',
        icon: <FileSearchOutlined />,
        label: 'IQC检验',
      },
      {
        key: '/inbound/suppliers',
        icon: <TeamOutlined />,
        label: '供应商管理',
      },
    ],
  },
  {
    key: 'outbound-group',
    icon: <ExportOutlined />,
    label: '出库管理',
    children: [
      {
        key: '/outbound/orders',
        icon: <ExportOutlined />,
        label: '出库单',
      },
      {
        key: '/outbound/boms',
        icon: <DatabaseOutlined />,
        label: 'BOM管理',
      },
    ],
  },
  {
    key: '/alerts',
    icon: <AlertOutlined />,
    label: '预警中心',
  },
  {
    key: '/reports',
    icon: <BarChartOutlined />,
    label: '报表分析',
  },
  {
    key: '/system/users',
    icon: <SettingOutlined />,
    label: '系统管理',
  },
];

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    navigate(key);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  // 获取当前选中的菜单项
  const selectedKeys = [location.pathname];
  const openKeys = (() => {
    const path = location.pathname;
    if (path.startsWith('/components') || path.startsWith('/categories')) return ['component-group'];
    if (path.startsWith('/inventory')) return ['inventory-group'];
    if (path.startsWith('/inbound')) return ['inbound-group'];
    if (path.startsWith('/outbound')) return ['outbound-group'];
    return [];
  })();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={220}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <Text
            strong
            style={{
              color: '#fff',
              fontSize: collapsed ? 14 : 18,
              whiteSpace: 'nowrap',
            }}
          >
            {collapsed ? 'ECM' : '电子元件管理'}
          </Text>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selectedKeys}
          defaultOpenKeys={openKeys}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 220, transition: 'all 0.2s' }}>
        <Header
          style={{
            padding: '0 24px',
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            position: 'sticky',
            top: 0,
            zIndex: 1,
          }}
        >
          <div
            style={{ cursor: 'pointer', fontSize: 18 }}
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </div>
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar icon={<UserOutlined />} />
              <Text>{user?.username || '用户'}</Text>
            </div>
          </Dropdown>
        </Header>
        <Content
          style={{
            margin: 24,
            padding: 24,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            minHeight: 'calc(100vh - 112px)',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
