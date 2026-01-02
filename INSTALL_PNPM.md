# 安装 pnpm 指南

## 方法 1: 使用 npm 安装（推荐）

如果您已经安装了 Node.js 和 npm，可以直接使用 npm 安装 pnpm：

```bash
npm install -g pnpm
```

## 方法 2: 使用 Homebrew 安装（macOS）

```bash
brew install pnpm
```

## 方法 3: 使用 curl 安装

```bash
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

安装完成后，重新打开终端或运行：

```bash
source ~/.zshrc  # 或 ~/.bashrc
```

## 方法 4: 使用 corepack（Node.js 16.13+）

如果您使用的是 Node.js 16.13 或更高版本，可以使用内置的 corepack：

```bash
corepack enable
corepack prepare pnpm@latest --activate
```

## 验证安装

安装完成后，验证 pnpm 是否安装成功：

```bash
pnpm --version
```

应该显示版本号，例如：`9.0.0`

## 如果不想安装 pnpm

如果您不想安装 pnpm，可以使用 npm 或 yarn 替代：

### 使用 npm

```bash
# 安装依赖
npm install

# 运行脚本
npm run dev
```

### 使用 yarn

```bash
# 安装依赖
yarn install

# 运行脚本
yarn dev
```

**注意**：项目中的 `pnpm-lock.yaml` 文件是为 pnpm 准备的，使用 npm 或 yarn 时会生成对应的锁文件。

