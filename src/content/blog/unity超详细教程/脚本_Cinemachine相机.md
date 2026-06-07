---
date: '2026-05-31'
tags:
  - Unity
  - Cinemachine
  - 相机
  - 虚拟相机
  - Confiner
title: Cinemachine 虚拟相机系统
series: unity超详细教程
seriesTitle: unity超详细教程
---

# Cinemachine 虚拟相机系统

## 什么是 Cinemachine

Cinemachine 是 Unity 官方提供的**智能相机系统**，通过"虚拟相机"（Virtual Camera）来替代传统的 Camera 脚本控制。它的优势是：
- 自动跟随目标
- 自动边界限制（Confiner）
- 平滑过渡、震动效果等开箱即用
- 无需手动编写相机跟随代码

## 安装步骤

### 1. 通过 Package Manager 安装

1. 打开菜单栏 `Window > Package Manager`
2. 在左上角下拉菜单中选择 "Unity Registry"
3. 搜索 "Cinemachine"
4. 点击 Install 安装

### 2. 或者通过命令安装（可选）

在 Unity 的 Package Manager 中点击 `+` 号 → "Add package by name..." → 输入 `com.unity.cinemachine`

## 创建虚拟相机

### 1. 创建 CM vcam

- 在 Hierarchy 面板右键 → `Cinemachine > 2D Camera`
- 或者通过菜单栏 `GameObject > Cinemachine > 2D Camera`

### 2. 设置跟随目标

选中创建的 CM vcam，在 Inspector 中找到：
- **Follow**：拖入玩家 GameObject（或玩家身上用于相机跟随的子物体）
- **Look At**：一般可以留空（2D 游戏中不需要注视）

### 3. 调整镜头参数

| 参数 | 说明 |
|------|------|
| **Lens > Orthographic Size** | 相机的正交大小（视口高度的一半），控制画面缩放 |
| **Body > Dead Zone** | 死区范围，玩家在死区内移动时相机不跟随（减少抖动） |
| **Body > Soft Zone** | 软区范围，玩家进入软区后相机开始平滑跟随 |

## 设置 Confiner（边界限制）

为了防止相机超出地图边界，需要添加 Confiner 组件：

### 1. 创建边界碰撞体

1. 在场景中创建一个空的 GameObject，命名为 "CameraConfiner"
2. 添加 `Polygon Collider 2D` 组件
3. 通过编辑碰撞体顶点，绘制出地图的可视范围边界
4. **勾选 `Is Trigger`**（Confiner 只需要边界形状，不需要物理碰撞）

### 2. 在 CM vcam 上添加 Confiner

1. 选中 CM vcam
2. 在 Inspector 中点击 `Add Extension` → 选择 `CinemachineConfiner2D`
3. 将之前创建的 "CameraConfiner" 拖入 `Bounding Shape 2D` 槽位

### 3. 设置 Confiner 模式

`Confiner 2D > Mode`：
- **Confine 2D**：标准模式，限制相机在 2D 多边形内部
- **Confine 2D (With Size)**：尺寸感知模式，自动考虑相机的 Orthographic Size

## ⚠️ 注意事项

### Lens Size 必须小于 Confiner 的最小宽度

这是最容易被忽略的问题。如果 `Lens > Orthographic Size` 设置的数值大于 Confiner 边界的最小尺寸，相机在靠近边界时会产生异常抖动或跳帧。

**计算方法**：
- `Orthographic Size` = 视口高度的一半
- 视口宽度 = Orthographic Size × 屏幕宽高比
- Confiner 的最小宽度必须 > 视口宽度

例如：
- 设置 `Orthographic Size = 5`
- 屏幕宽高比 16:9
- 视口宽度 = 5 × 2 × (16/9) ≈ 17.7
- 所以 Confiner 边界的宽度必须 > 17.7

### 多个虚拟相机的优先级

如果场景中有多个虚拟相机，通过 **Priority** 值决定使用哪个：
- Priority 值越高的相机越优先
- 常用做法：普通状态 Priority = 10，特殊场景（如 Boss 战）Priority = 20
- 虚拟相机之间可以通过 Cinemachine Brain 组件实现平滑切换（带有过渡动画）

## 项目中的应用

在当前项目中：
- 虚拟相机（CM vcam）跟随玩家移动
- 通过 Confiner 限制相机不超出地图边界
- 配合 [[脚本_Elevation_Entry_Exit\|Elevation Entry/Exit]] 的高地系统，相机视野不受高地遮挡影响

## 补充：Cinemachine Brain

当创建虚拟相机时，Unity 会自动在主摄像机上添加 `Cinemachine Brain` 组件。这个组件负责：
- 管理所有虚拟相机之间的切换
- 处理相机过渡动画（如淡入淡出、滑动等）
- 可在 Inspector 中调整 `Default Blend` 来设置默认过渡效果

## 参考链接

- [Cinemachine 官方文档](https://docs.unity3d.com/Packages/com.unity.cinemachine@latest)
