#!/usr/bin/env bash
set -e

echo "================================"
echo " ECM - 启动后端 (Spring Boot)"
echo "================================"
echo

cd "$(dirname "$0")/backend"

echo "[1/2] 检查 Maven..."
if ! command -v mvn &>/dev/null; then
    echo "[错误] 未找到 mvn，请确保 Maven 已安装并加入 PATH"
    exit 1
fi

echo "[2/2] 启动 Spring Boot..."
mvn spring-boot:run
