---
date: '2026-05-31'
tags:
  - Unity
  - 脚本
  - 单例
  - 管理器
  - 数值
title: StatsManager 数值管理器脚本
---

# StatsManager 数值管理器脚本

## 这个脚本是做什么的

作为**全局唯一**的数值管理中心，采用**单例模式**，所有角色属性（战斗、移动、生命）集中存储在这里。项目中任何脚本都可以通过 `StatsManager.instance.xxx` 来读写数值。

挂载在场景中的一个 GameObject 上（通常命名为 GameManager 或 StatsManager）。

## 为什么需要这个管理器

在没有 StatsManager 之前，每个脚本各自声明自己的数值变量。这导致：
- **查找困难**：想修改移动速度，不知道是在 PlayerMovement 中还是在其他地方
- **重复声明**：多个脚本可能需要访问同一个数值（如 damage），各存一份容易不一致
- **难以扩展**：想加一个新属性（如暴击率），需要找到所有相关脚本手动添加

StatsManager 通过单例模式集中管理所有数值，**一处修改，全局生效**。

## 运行逻辑

### 变量声明

使用 `[Header()]` 特性在 Inspector 中分组显示：

| 分组 | 变量 | 类型 | 说明 |
|------|------|------|------|
| Combat Stats | `damage` | `int` | 玩家攻击力 |
| | `weaponRange` | `float` | 武器攻击范围半径 |
| | `stunTime` | `float` | 击退后的眩晕时间（秒） |
| | `knockbackForce` | `float` | 击退力度 |
| | `knockbackTime` | `float` | 击退飞行时间（秒） |
| Movement Stats | `speed` | `float` | 玩家移动速度 |
| Health Stats | `maxHealth` | `int` | 最大生命值 |
| | `currentHealth` | `int` | 当前生命值 |

### Awake() —— 单例初始化

在脚本实例化时执行（比 Start 更早）：
1. 检查静态变量 `instance` 是否为 null
2. 如果为 null，将当前实例赋给 `instance`
3. 如果不为 null，销毁当前 GameObject，确保只有一个实例

### 单例模式要点

```csharp
public static StatsManager instance;  // 静态引用，全局可访问

private void Awake()
{
    if (instance == null)
        instance = this;  // 第一次创建，设为实例
    else
        Destroy(gameObject);  // 已有实例，销毁多余的
}
```

使用方式：任何脚本中写 `StatsManager.instance.damage` 即可访问。

## 与其他脚本的交互

几乎所有脚本都依赖 StatsManager：
- [[脚本_Player_Combat\|Player_Combat]]：读取 damage、weaponRange、击退相关数值
- [[脚本_PlayerHealth\|PlayerHealth]]：读取/修改 currentHealth、maxHealth
- [[脚本_PlayerMovement\|PlayerMovement]]：需读取 speed（当前代码存在编译问题，见下方说明）
- [[脚本_StatsUI\|StatsUI]]：读取 damage、speed 用于 UI 显示
- [[脚本_Enemy_Combat\|Enemy_Combat]]：使用本地变量，不依赖 StatsManager（敌人有自己的数值）

### ⚠️ 已知问题：PlayerMovement.speed 未正确引用

当前 [[脚本_PlayerMovement\|PlayerMovement]] 的 FixedUpdate() 中写的是 `rb.linearVelocity = new Vector2(horizontal * speed, vertical * speed)`，但 `speed` 变量已经从 PlayerMovement 中移除并迁移到了 StatsManager。

**需要手动将 `* speed` 改为 `* StatsManager.instance.speed`**，否则会产生编译错误。

## 完整代码

```csharp
using UnityEngine;

public class StatsManager : MonoBehaviour
{
    public static StatsManager instance;
    
    [Header("Combat Stats")]
    public int damage;
    public float weaponRange;
    public float stunTime;
    public float knockbackForce;
    public float knockbackTime;

    [Header("Movement Stats")]
    public float speed;

    [Header("Health Stats")]
    public int maxHealth;
    public int currentHealth;

    private void Awake()
    {
        if (instance == null)
            instance = this;
        else
            Destroy(gameObject);
    }
}
```

## 版本变更记录

| 版本 | 变更内容 |
|------|----------|
| v1 | 创建单例模式基础结构，包含战斗、移动、生命三组数值 |
