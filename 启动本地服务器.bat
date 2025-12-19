@echo off
chcp 65001 >nul
echo ========================================
echo   作业系统本地服务器启动工具
echo ========================================
echo.

cd /d "%~dp0"

echo 正在检测Python环境...
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo [√] 检测到Python环境
    echo.
    echo 正在启动本地服务器...
    echo.
    echo 服务器地址: http://localhost:8000
    echo.
    echo 请在浏览器中打开以下地址：
    echo   - http://localhost:8000/未填写的作业.html
    echo   - http://localhost:8000/完成版作业.html
    echo.
    echo 按 Ctrl+C 停止服务器
    echo ========================================
    echo.
    python -m http.server 8000
    goto :end
)

echo [×] 未检测到Python环境
echo.
echo 请选择以下方式之一：
echo 1. 安装Python: https://www.python.org/downloads/
echo 2. 使用VS Code的Live Server扩展
echo 3. 直接双击HTML文件（需要网络连接）
echo.
pause
:end

