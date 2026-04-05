#!/usr/bin/env bash
set -e

echo "================================"
echo " ECM - 启动前端 (Vite Dev)"
echo "================================"
echo

cd "$(dirname "$0")/frontend"

if [ ! -d "node_modules" ]; then
    echo "[1/2] 安装依赖..."
    npm install
    echo
else
    echo "[1/2] 依赖已存在，跳过安装"
fi

echo "[2/2] 启动 Vite 开发服务器..."
npm run dev
