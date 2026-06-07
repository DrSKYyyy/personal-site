---
date: '2026-05-31'
tags:
  - Unity
  - 脚本
  - 敌人
  - 击退
  - 眩晕
  - 协程
title: Enemy_Knockback 敌人击退脚本
series: unity超详细教程
seriesTitle: Unity超详细教程
seriesSection: 脚本
seriesOrder: 106.0
---

# Enemy_Knockback 敌人击退脚本

## 这个脚本是做什么的

处理敌人的**击退和眩晕效果**。当玩家攻击敌人时，敌人在击退时间内被弹飞，然后在眩晕时间内无法行动，最后恢复 Idle 状态。与 [[脚本_Enemy_Movement\|Enemy_Movement]] 的状态机紧密配合。

挂载在敌人 GameObject 上。

## 运行逻辑

### 变量声明

| 变量 | 类型 | 说明 |
|------|------|------|
| `rb` | `Rigidbody2D` | 私有，引用自身的刚体，用于施加击退速度 |
| `enemy_Movement` | `Enemy_Movement` | 私有，引用同物体上的 [[脚本_Enemy_Movement\|Enemy_Movement]] 脚本 |

### Start() —— 初始化

获取自身的 Rigidbody2D 和 Enemy_Movement 组件。

### Knockback() —— 执行击退

由 [[脚本_Player_Combat\|Player_Combat]] 的 `DealDamage()` 调用：

1. 通过 `enemy_Movement.ChangeState(EnemyState.Knockback)` 通知状态机切换到击退状态
   - 切换到 Knockback 状态后，[[脚本_Enemy_Movement\|Enemy_Movement]] 的 Update() 中将跳过玩家检测和移动逻辑
2. 启动 `StunTimer` 协程
3. 计算从玩家指向敌人的方向向量，归一化后乘以 `knockbackForce` 作为击退速度

### StunTimer() 协程 —— 两段式控制

协程按顺序执行两个等待阶段：

1. **第一阶段 —— 击退飞行**：等待 `knockbackTime` 秒
   - 这段时间内敌人被弹飞（在第 1 帧已设置速度，物理引擎会处理后续飞行）
   - 等待结束后：将刚体速度归零，敌人停下来
2. **第二阶段 —— 眩晕**：再等待 `stunTime` 秒
   - 这段时间内敌人无法行动
   - 等待结束后：调用 `enemy_Movement.ChangeState(EnemyState.Idle)` 恢复空闲状态

### 调试信息

```csharp
Debug.Log("Knockback applied.");
```
在 `Knockback()` 方法中输出调试日志，方便测试时确认击退是否被触发。

## 两段式设计的原理

为什么分成 knockbackTime 和 stunTime？

- **knockbackTime（击退时间）**：敌人被击飞的过程。这段时间刚体受到 velocity 影响在物理移动。时间到了就停止。
- **stunTime（眩晕时间）**：敌人落地后继续发愣的时间。这段时间敌人完全无法行动，之后才恢复。

可以理解为："弹飞 0.3 秒 + 晕在原地 0.5 秒 = 总共 0.8 秒无法行动"

## 与其他脚本的交互

- [[脚本_Enemy_Movement\|Enemy_Movement]]：调用 `ChangeState(EnemyState.Knockback)` 和恢复时的 `ChangeState(EnemyState.Idle)`
- [[脚本_Player_Combat\|Player_Combat]]：玩家攻击时触发本脚本的 `Knockback()` 方法
- [[脚本_StatsManager\|StatsManager]]：玩家攻击时从 StatsManager 读取击退力和击退时间传入

## 完整代码

```csharp
using UnityEngine;
using System.Collections;

public class Enemy_Knockback : MonoBehaviour
{

    private Rigidbody2D rb;
    private Enemy_Movement enemy_Movement;

    void Start()
    {
        rb = GetComponent<Rigidbody2D>();
        enemy_Movement = GetComponent<Enemy_Movement>();
    }

    public void Knockback(Vector2 playerTransform, float knockbackForce, float knockbackTime, float stunTime)
    {
        enemy_Movement.ChangeState(EnemyState.Knockback);
        StartCoroutine(StunTimer(knockbackTime, stunTime));
        Vector2 direction = ((Vector2)transform.position - playerTransform).normalized;
        rb.linearVelocity = direction * knockbackForce;
        Debug.Log("Knockback applied.");
    }

    IEnumerator StunTimer(float knockbackTime, float stunTime)
    {

        yield return new WaitForSeconds(knockbackTime);
        rb.linearVelocity = Vector2.zero;
        yield return new WaitForSeconds(stunTime);
        enemy_Movement.ChangeState(EnemyState.Idle);
    }
}
```

## 版本变更记录

| 版本 | 变更内容 |
|------|----------|
| v1 | 基本击退逻辑：Knockback + StunTimer 协程 |
| v2 | 添加 Debug.Log 用于调试 |
