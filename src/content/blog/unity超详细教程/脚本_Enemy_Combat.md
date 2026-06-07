---
date: '2026-05-31'
tags:
  - Unity
  - 脚本
  - 敌人
  - 战斗
  - 攻击
title: Enemy_Combat 敌人战斗脚本
series: unity超详细教程
seriesTitle: unity超详细教程
---

# Enemy_Combat 敌人战斗脚本

## 这个脚本是做什么的

处理敌人的**攻击逻辑**：检测攻击范围内是否有玩家，对玩家造成伤害并施加击退效果。通常通过 Animation Event 在攻击动画的特定帧调用。

挂载在敌人 GameObject 上。

## 运行逻辑

### 变量声明

| 变量 | 类型 | 说明 |
|------|------|------|
| `damage` | `int` | 攻击伤害值，默认 1 |
| `attackPoint` | `Transform` | 攻击判定的原点（通常是武器位置或敌人前方） |
| `weaponRange` | `float` | 攻击判定半径 |
| `knockbackForce` | `float` | 击退力度 |
| `stunTime` | `float` | 击退后的眩晕时间 |
| `playerLayer` | `LayerMask` | 玩家所在的层级 |

### Attack() —— 执行攻击

在攻击动画中通过 Animation Event 调用此方法：

1. 用 `Physics2D.OverlapCircleAll` 检测以 `attackPoint` 为中心、`weaponRange` 为半径范围内，属于 `playerLayer` 的所有碰撞体
2. 如果检测到玩家（`hits.Length > 0`）：
   - 取第一个检测到的玩家 → `hits[0]`
   - 调用 `PlayerHealth.ChangeHealth(-damage)` 扣血
   - 调用 `PlayerMovement.Knockback(transform, knockbackForce, stunTime)` 击退玩家

### 为什么不使用 StatsManager 中的数值？

敌人使用自己的本地变量（damage、knockbackForce 等），而不是像玩家那样依赖 [[脚本_StatsManager\|StatsManager]]。这是因为**不同种类的敌人可能需要不同的数值**（比如普通哥布林伤害 1，Boss 伤害 5），每个敌人独立配置更灵活。

## 与其他脚本的交互

- [[脚本_PlayerHealth\|PlayerHealth]]：调用 `ChangeHealth()` 对玩家造成伤害
- [[脚本_PlayerMovement\|PlayerMovement]]：调用 `Knockback()` 击退玩家
- [[脚本_Enemy_Movement\|Enemy_Movement]]：由 Enemy_Movement 的状态机驱动（Attacking 状态 → Animation Event → 调用本脚本的 Attack()）

## 完整代码

```csharp
using UnityEngine;

public class Enemy_Combat : MonoBehaviour
{

    public int damage = 1;
    public Transform attackPoint;
    public float weaponRange;
    public float knockbackForce;
    public float stunTime;

    public LayerMask playerLayer;
    
    public void Attack()
    { 
        Collider2D[] hits = Physics2D.OverlapCircleAll(attackPoint.position, weaponRange, playerLayer);
        if (hits.Length > 0)
        {
            hits[0].gameObject.GetComponent<PlayerHealth>().ChangeHealth(-damage);
            hits[0].gameObject.GetComponent<PlayerMovement>().Knockback(transform, knockbackForce, stunTime);

        }
    }
}
```

## 版本变更记录

| 版本 | 变更内容 |
|------|----------|
| v1 | 基本攻击逻辑：OverlapCircleAll 检测玩家，扣血并击退 |
