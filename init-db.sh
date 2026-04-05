#!/usr/bin/env bash
set -e

echo "================================"
echo " ECM - 初始化数据库"
echo "================================"
echo

DB_USER="root"
DB_PASS="root"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SQL_FILE="$SCRIPT_DIR/sql/init.sql"

if [ ! -f "$SQL_FILE" ]; then
    echo "[错误] 未找到 $SQL_FILE"
    exit 1
fi

echo "即将执行: mysql -u $DB_USER -p$DB_PASS < sql/init.sql"
echo "数据库 ecm_db 将被重建，原有数据会丢失！"
echo
read -p "确认继续？(y/N): " CONFIRM
if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
    echo "已取消"
    exit 0
fi

echo
if mysql -u "$DB_USER" -p"$DB_PASS" < "$SQL_FILE"; then
    echo
    echo "[成功] 数据库初始化完成"
else
    echo
    echo "[错误] 数据库初始化失败，请检查 MySQL 是否运行以及用户名/密码"
    exit 1
fi
