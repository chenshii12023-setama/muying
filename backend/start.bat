@echo off
echo 启动宝妈育儿轻指南后端服务...
echo.

REM 检查Java版本
java -version
if %ERRORLEVEL% neq 0 (
    echo 错误：未找到Java，请确保已安装JDK 17或更高版本
    pause
    exit /b 1
)

REM 检查Maven
mvn -version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo 错误：未找到Maven，请确保已安装Maven
    pause
    exit /b 1
)

echo 正在编译项目...
mvn clean compile

if %ERRORLEVEL% neq 0 (
    echo 编译失败，请检查代码
    pause
    exit /b 1
)

echo 正在启动应用...
mvn spring-boot:run

pause