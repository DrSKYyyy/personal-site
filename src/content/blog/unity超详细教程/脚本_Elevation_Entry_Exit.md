---
date: '2026-05-31'
tags:
  - Unity
  - 脚本
  - 高地
  - 地形
  - 碰撞体
  - 渲染层级
title: Elevation_Entry / Exit 高地进出脚本
---

# Elevation_Entry / Exit 高地进出脚本

## 这两个脚本是做什么的

管理游戏中的**高地（Elevation）系统**。当玩家进入高地时，关闭山脉遮挡碰撞体、开启边界限制碰撞体、提高玩家渲染层级；退出时反向操作，恢复原状。

这是两个独立的脚本，逻辑互为镜像。

## 为什么需要高地系统

在 2D 游戏中，角色走到山脉后方（高地）时：
- **山脉遮挡**：角色在山脉后面，应该显示在山脉前面（即玩家渲染层级更高）
- **边界限制**：在高地上时，需要限制玩家不能走出高地边缘（开启边界碰撞体）
- **退出恢复**：离开高地时，恢复普通地形渲染层级，关闭边界限制

## Entry 脚本逻辑

### 变量声明

| 变量 | 类型 | 说明 |
|------|------|------|
| `mountainColliders` | `Collider2D[]` | 山脉的碰撞体数组（通常是充当遮挡物的山脉精灵的 Collider） |
| `boundaryColliders` | `Collider2D[]` | 高地的边界碰撞体数组（限制玩家不能走出去） |

### OnTriggerEnter2D() —— 进入高地

当玩家（Tag = "Player"）进入触发区域时：
1. 遍历 `mountainColliders` 数组，将每个山脉碰撞体的 `enabled` 设为 `false`（山脉不再阻挡玩家）
2. 遍历 `boundaryColliders` 数组，将每个边界碰撞体的 `enabled` 设为 `true`（限制玩家在高地范围内）
3. 将玩家的 SpriteRenderer 的 `sortingOrder` 设为 15（提高渲染层级，显示在山脉前面）

> **注意**：`collision.gameObject.GetComponent<SpriteRenderer>().sortingOrder = 15` 在**条件判断之外**，即使进入的不是玩家也会执行。如果需要严格限制，应将其移至 if 块内部。但在当前设计中，只有玩家碰撞体触发了这个触发器，所以不会有问题。

## Exit 脚本逻辑

### 变量声明

与 Entry 完全相同的结构。

### OnTriggerEnter2D() —— 退出高地

与 Entry 逻辑完全相反：
1. 遍历 `mountainColliders` 数组，将每个山脉碰撞体的 `enabled` 设为 `true`（恢复山脉遮挡）
2. 遍历 `boundaryColliders` 数组，将每个边界碰撞体的 `enabled` 设为 `false`（关闭边界限制）
3. 将玩家的 SpriteRenderer 的 `sortingOrder` 设为 10（恢复普通渲染层级）

## 配置步骤

1. 在进入高地的位置放置一个 GameObject，添加 Box Collider 2D 并设为 Trigger
2. 挂载 Elevation_Entry 脚本
3. 将山脉精灵的 Collider 拖入 `mountainColliders` 数组
4. 将高地边界碰撞体拖入 `boundaryColliders` 数组
5. 在退出高地的位置放置另一个 Trigger，挂载 Elevation_Exit 脚本
6. 将相同的山脉和边界碰撞体引用到 Exit 脚本中（逻辑自动反向处理）

## 与其他脚本的交互

- [[脚本_PlayerHealth\|PlayerHealth]] / [[脚本_PlayerMovement\|PlayerMovement]]：修改玩家 SpriteRenderer 的 sortingOrder，影响渲染

## 完整代码

### Elevation_Entry.cs

```csharp
using UnityEngine;

public class Elevation_Entry : MonoBehaviour
{

    public Collider2D[] mountainColliders;
    public Collider2D[] boundaryColliders;


    private void OnTriggerEnter2D(Collider2D collision)
    {
        if (collision.CompareTag("Player"))
        {
            foreach (Collider2D mountain in mountainColliders)
            {
                mountain.enabled = false;
            }
            
            foreach (Collider2D boundary in boundaryColliders)
            {
                boundary.enabled = true;
            }
        }

        collision.gameObject.GetComponent<SpriteRenderer>().sortingOrder = 15;
    }
}
```

### Elevation_Exit.cs

```csharp
using UnityEngine;

public class Elevation_Exit : MonoBehaviour
{

    public Collider2D[] mountainColliders;
    public Collider2D[] boundaryColliders;


    private void OnTriggerEnter2D(Collider2D collision)
    {
        if (collision.CompareTag("Player"))
        {
            foreach (Collider2D mountain in mountainColliders)
            {
                mountain.enabled = true;
            }
            
            foreach (Collider2D boundary in boundaryColliders)
            {
                boundary.enabled = false;
            }
        }

        collision.gameObject.GetComponent<SpriteRenderer>().sortingOrder = 10;
    }
}
```

## 版本变更记录

| 版本 | 变更内容 |
|------|----------|
| v1 | 创建 Entry 和 Exit 两个脚本，统一的高地进出逻辑 |
