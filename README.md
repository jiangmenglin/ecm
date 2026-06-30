# ECM - 电子元件管理系统

- Electronic Component Management System — 面向电子制造企业的全流程元件管理平台，覆盖元件目录、库存管理、入库/出库物流、质量检验、预警通知及报表分析。
- 本项目所有（100%）代码均由 AI 生成。运行前请自行审查，任何后果概不负责。

## 技术栈

| 层级 | 技术 |
|------|------|
| 后端 | Spring Boot 3.2.5 · Java 17 · Spring Data JPA · Spring Security + JWT (jjwt 0.12.5) |
| 前端 | React 18 · TypeScript · Vite 5 · Ant Design 5 · Zustand · React Router 6 · Axios |
| 数据库 | MySQL 8.x |

## 项目结构

```
ecm/
├── backend/                # Spring Boot REST API
│   └── src/main/java/com/ecm/
│       ├── component/      # 元件目录、分类、参数、替代料
│       ├── inventory/      # 仓库、库位、库存、批次、锁定
│       ├── inbound/        # 采购订单、入库单、IQC 检验、供应商
│       ├── outbound/       # 出库单、BOM 管理
│       ├── alert/          # 预警规则与记录
│       ├── report/         # 报表、仪表盘、操作日志
│       ├── system/         # 用户、角色、认证
│       ├── common/         # 通用响应包装、分页、异常处理
│       ├── config/         # CORS、JPA 配置
│       └── security/       # JWT 过滤器、Token Provider
├── frontend/               # React SPA
│   └── src/
│       ├── api/            # Axios 实例与接口函数
│       ├── pages/          # 页面组件（按业务域划分）
│       ├── router/         # 路由与权限守卫
│       ├── store/          # Zustand 状态管理
│       └── types/          # TypeScript 类型定义
├── sql/
│   └── init.sql            # 数据库建表与种子数据
├── start-backend.bat/.sh   # 启动后端
├── start-frontend.bat/.sh  # 启动前端
├── start-all.bat/.sh       # 同时启动前后端
└── init-db.bat/.sh         # 初始化数据库
```

## 功能模块

| 模块 | 说明 |
|------|------|
| 元件管理 | 元件 CRUD、分类树、参数模板、替代料关系 |
| 库存管理 | 多仓库/库位、批次追溯、库存锁定、安全库存 |
| 入库管理 | 采购订单、入库单、IQC 来料检验、供应商管理 |
| 出库管理 | 出库单审批、BOM 管理、生产领料 |
| 预警中心 | 低库存、过期、呆滞物料预警，规则配置 |
| 报表分析 | 库存概览、周转率分析、呆滞料分析、操作日志 |
| 系统管理 | 用户管理、角色权限、JWT 认证 |

## 快速开始

### 环境要求

- **Java 17+**
- **Maven 3.6+**
- **Node.js 18+**
- **MySQL 8.x**（运行于 `localhost:3306`）

### 1. 初始化数据库

```bash
# Windows
init-db.bat

# Linux / macOS / Git Bash
bash init-db.sh

# 或手动执行
mysql -u root -p < sql/init.sql
```

默认数据库连接：`root/root@localhost:3306/ecm_db`（可在 `backend/src/main/resources/application.yml` 中修改）。

### 2. 启动服务

**方式一：使用启动脚本**

```bash
# Windows — 双击运行
start-all.bat          # 同时启动前后端
start-backend.bat      # 仅启动后端
start-frontend.bat     # 仅启动前端

# Linux / macOS / Git Bash
bash start-all.sh
```

**方式二：手动启动**

```bash
# 后端（端口 9090）
cd backend
mvn spring-boot:run

# 前端（端口 80，自动代理 /api → 9090）
cd frontend
npm install
npm run dev
```

### 3. 访问系统

- 前端页面：http://localhost
- 后端 API：http://localhost:9090/api

## API 规范

- 所有响应使用统一包装：`{ "code": 200, "message": "success", "data": T }`
- 分页接口返回：`{ "list": [], "total": 0, "page": 1, "pageSize": 20 }`
- 认证方式：JWT Bearer Token（`Authorization: Bearer <token>`）

## 构建部署

```bash
# 后端打包
cd backend
mvn clean package -DskipTests
java -jar target/ecm-backend-1.0.0.jar

# 前端构建
cd frontend
npm run build          # 输出到 dist/
npm run preview        # 本地预览生产构建
```

## License

MIT
