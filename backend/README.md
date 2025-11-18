# 宝妈育儿轻指南 - Spring Boot 后端

## 项目简介

这是"宝妈育儿轻指南"小程序的Spring Boot后端服务，提供完整的育儿管理功能API。

## 技术栈

- **框架**: Spring Boot 3.2.0
- **数据库**: MySQL 8.0
- **安全认证**: Spring Security + JWT
- **ORM**: Spring Data JPA + Hibernate
- **构建工具**: Maven
- **Java版本**: JDK 17

## 功能模块

### 1. 用户管理
- 用户注册/登录
- 微信小程序登录
- JWT Token认证
- 用户信息管理

### 2. 宝宝成长记录
- 宝宝档案管理
- 身高体重记录
- 生长曲线展示
- 里程碑记录

### 3. 母婴设施地图
- 附近设施查询
- 设施评价系统
- 用户贡献设施

### 4. 闲置物品交易
- 物品发布管理
- 交易记录追踪
- 安全交易机制

### 5. AI助手与食谱
- 智能问答记录
- 辅食食谱管理
- 营养信息计算

## 快速开始

### 1. 环境要求
- JDK 17+
- Maven 3.6+
- MySQL 8.0+

### 2. 数据库配置
```sql
-- 创建数据库
CREATE DATABASE mombaby_guide CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建用户（可选）
CREATE USER 'mombaby'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON mombaby_guide.* TO 'mombaby'@'localhost';
FLUSH PRIVILEGES;
```

### 3. 配置文件
修改 `src/main/resources/application.yml` 中的数据库连接信息：

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/mombaby_guide?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=Asia/Shanghai
    username: your_username
    password: your_password
```

### 4. 启动应用
```bash
# 克隆项目
git clone <repository-url>

# 进入项目目录
cd backend

# 编译运行
mvn spring-boot:run
```

应用启动后访问: http://localhost:8080/api

## API文档

### 认证相关

#### 用户注册
```
POST /api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "password": "password123",
  "nickname": "测试用户",
  "phoneNumber": "13800138000",
  "email": "test@example.com"
}
```

#### 用户登录
```
POST /api/auth/login
Content-Type: application/json

{
  "username": "testuser",
  "password": "password123"
}
```

#### 微信登录
```
POST /api/auth/wechat-login?openid=wx_openid&nickname=用户昵称&avatarUrl=头像URL
```

### 宝宝管理

#### 创建宝宝档案
```
POST /api/babies
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "小明",
  "nickname": "明明",
  "birthDate": "2023-01-01",
  "gender": "male",
  "bloodType": "A",
  "birthWeight": 3.5,
  "birthHeight": 50.0
}
```

#### 获取宝宝列表
```
GET /api/babies
Authorization: Bearer <token>
```

### 成长记录

#### 添加成长记录
```
POST /api/growth-records
Authorization: Bearer <token>
Content-Type: application/json

{
  "babyId": 1,
  "recordDate": "2023-06-01",
  "weight": 8.5,
  "height": 68.0,
  "headCircumference": 43.0,
  "notes": "宝宝健康活泼"
}
```

#### 获取成长记录
```
GET /api/growth-records/baby/{babyId}
Authorization: Bearer <token>
```

### 母婴设施

#### 获取附近设施
```
GET /api/facilities/nearby?latitude=39.9042&longitude=116.4074&radius=5
```

#### 按类型获取附近设施
```
GET /api/facilities/nearby?type=nursing_room&latitude=39.9042&longitude=116.4074&radius=5
```

## 项目结构

```
src/main/java/com/mombaby/
├── common/              # 公共类
│   └── Result.java       # 统一响应结果
├── config/              # 配置类
│   └── SecurityConfig.java # Spring Security配置
├── controller/          # 控制器
│   ├── AuthController.java
│   ├── BabyController.java
│   ├── GrowthRecordController.java
│   └── ...
├── entity/              # 实体类
│   ├── User.java
│   ├── Baby.java
│   ├── GrowthRecord.java
│   └── ...
├── repository/           # 数据访问层
│   ├── UserRepository.java
│   ├── BabyRepository.java
│   └── ...
├── service/             # 业务逻辑层
│   ├── UserService.java
│   ├── BabyService.java
│   └── impl/
├── security/            # 安全相关
│   └── JwtAuthenticationFilter.java
├── util/                # 工具类
│   └── JwtTokenUtil.java
└── exception/           # 异常处理
    └── GlobalExceptionHandler.java
```

## 安全配置

### JWT认证
- 使用JWT进行用户认证
- Token过期时间：24小时
- 支持Token刷新机制

### 权限控制
- 普通用户：只能操作自己的数据
- 管理员：可以管理所有数据
- API访问需要有效的JWT Token

## 数据库设计

主要数据表：
- `users` - 用户表
- `babies` - 宝宝表
- `baby_growth_records` - 成长记录表
- `milestones` - 里程碑表
- `maternal_facilities` - 母婴设施表
- `secondhand_items` - 闲置物品表
- `baby_food_recipes` - 辅食食谱表

## 开发说明

### 代码规范
- 使用Lombok简化代码
- 遵循RESTful API设计
- 统一的异常处理
- 完整的参数验证

### 测试
```bash
# 运行单元测试
mvn test

# 运行集成测试
mvn verify
```

### 部署
```bash
# 打包应用
mvn clean package

# 运行JAR包
java -jar target/mombaby-guide-backend-1.0.0.jar
```

## 常见问题

### 1. 数据库连接失败
检查数据库配置和MySQL服务是否启动

### 2. JWT Token过期
调用刷新Token接口获取新的Token

### 3. 跨域问题
已配置CORS，支持跨域访问

## 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交代码
4. 发起 Pull Request

## 联系我们

如有问题请联系开发团队。

---

**宝妈育儿轻指南** - 让育儿更轻松，让妈妈更安心 💖