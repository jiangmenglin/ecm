#!/usr/bin/env bash
set -e

echo "================================"
echo " ECM - 启动全部服务"
echo "================================"
echo

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "将在两个终端中分别启动后端和前端"
echo

# 后端 (后台运行)
echo "启动后端..."
cd "$SCRIPT_DIR"
bash start-backend.sh &
BACKEND_PID=$!

# 等后端开始编译后再启动前端
sleep 3

# 前端 (后台运行)
echo "启动前端..."
cd "$SCRIPT_DIR"
bash start-frontend.sh &
FRONTEND_PID=$!

echo
echo "后端: http://localhost:9090  (PID: $BACKEND_PID)"
echo "前端: http://localhost:80  (PID: $FRONTEND_PID)"
echo
echo "按 Ctrl+C 停止所有服务"

# 等待任一进程退出
wait -n 2>/dev/null || wait $BACKEND_PID $FRONTEND_PID
