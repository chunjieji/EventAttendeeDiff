# 活动人员对比工具 - 使用说明

## 项目介绍

活动人员对比工具是一款专为活动组织者设计的Web应用，旨在解决活动签到统计问题。通过比对预期参加人员名单与实际参加人员名单，快速识别缺席人员，提高活动管理效率。

## 功能特点

- **多种输入方式**：支持文本输入和图片上传
- **AI图像识别**：使用智谱GLM-4V-Flash API自动识别图片中的人名
- **智能比对**：自动比对预期与实际参加人员，生成缺席名单
- **结果可视化**：直观展示出勤率和缺席人员
- **响应式设计**：适配桌面和移动设备

## 技术栈

- **前端**：Next.js, React, TypeScript, TailwindCSS
- **API**：智谱GLM-4V-Flash API
- **部署**：Vercel

## 快速开始

### 安装依赖

```bash
npm install
# 或
yarn install
```

### 开发环境运行

```bash
npm run dev
# 或
yarn dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本

```bash
npm run build
# 或
yarn build
```

### 运行生产版本

```bash
npm run start
# 或
yarn start
```

## 环境变量配置

创建 `.env.local` 文件，添加以下内容：

```
ZHIPU_API_KEY=你的智谱API密钥
ZHIPU_API_URL=https://open.bigmodel.cn/api/paas/v4/chat/completions
```

## 使用说明

1. 在"预期参加人员"区域输入或上传预期参加活动的人员名单
2. 在"实际参加人员"区域输入或上传实际参加活动的人员名单
3. 点击"比对名单"按钮进行比对
4. 查看比对结果，包括出勤率和缺席人员名单
5. 可以点击"复制名单"按钮复制缺席人员名单

## 注意事项

- 图片识别功能依赖于智谱GLM-4V-Flash API，请确保API密钥有效
- 人名可以使用逗号、空格或回车符分隔
- 支持的图片格式：JPG、PNG等常见格式