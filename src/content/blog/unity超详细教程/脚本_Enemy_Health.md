---
date: '2026-05-31'
tags:
  - Unity
  - 脚本
  - 敌人
  - 生命值
  - 事件
title: Enemy_Health 敌人生命值脚本
series: unity超详细教程
seriesTitle: Unity超详细教程
seriesSection: 脚本
seriesOrder: 105.0
---

# Enemy_Health 敌人生命值脚本

## 这个脚本是做什么的

管理敌人的**生命值**，当生命值归零时触发死亡事件并销毁敌人，同时通过 C# 事件机制通知其他系统（如经验系统）处理后续逻辑。

挂载在敌人 GameObject 上。

## 运行逻辑

### 变量声明

| 变量 | 类型 | 说明 |
|------|------|------|
| `expReward` | `int` | 击败此敌人后获得的经验值，默认 3 |
| `currentHealth` | `int` | 当前生命值 |
| `maxHealth` | `int` | 最大生命值 |

还有一个**委托和事件**：
```csharp
public delegate void MonsterDefeated(int exp);
public static event MonsterDefeated onMonsterDefeated;
```

### Start() —— 初始化

将 `currentHealth` 设为 `maxHealth`。

### ChangeHealth(int amount) —— 改变生命值

由其他脚本调用（如 [[脚本_Player_Combat\|Player_Combat]] 攻击敌人时）：
1. `currentHealth += amount`
   - `amount` 为正数 → 治疗
   - `amount` 为负数 → 扣血（玩家攻击时传 `-StatsManager.instance.damage`）
2. 如果 `currentHealth <= 0`（死亡）：
   - 通过 `onMonsterDefeated?.Invoke(expReward)` 触发死亡事件，通知订阅者（如 [[脚本_ExpManager\|ExpManager]]）处理经验获取
   - 销毁当前 GameObject
3. 如果 `currentHealth > maxHealth`（超过上限），则限制为 maxHealth

## C# 事件机制说明

### 委托（Delegate）

```csharp
public delegate void MonsterDefeated(int exp);
```
定义了一个方法签名：接受一个 int 参数（经验值），无返回值。

### 事件（Event）

```csharp
public static event MonsterDefeated onMonsterDefeated;
```
- `static`：所有敌人实例共享同一个事件，订阅者只需要订阅一次即可接收所有敌人的死亡通知
- `event` 关键字：外部只能 `+=` 或 `-=` 订阅/取消订阅，不能直接触发（不能 `onMonsterDefeated.Invoke()` 从外部调用）

### 安全调用（?.Invoke()）

```csharp
onMonsterDefeated?.Invoke(expReward);
```
- `?.` 是 null 条件运算符：如果 `onMonsterDefeated` 为 null（没有订阅者），则不执行 `.Invoke()`
- 这样可以避免在没有订阅者时调用事件导致的 NullReferenceException

## 与其他脚本的交互

- [[脚本_Player_Combat\|Player_Combat]]：调用 `ChangeHealth(-damage)` 对敌人造成伤害
- [[脚本_ExpManager\|ExpManager]]：订阅 `onMonsterDefeated` 事件，敌人死亡时获得经验
- [[脚本_Enemy_Movement\|Enemy_Movement]]：敌人死亡时一起销毁（在同一 GameObject 上）

## 完整代码

```csharp
using UnityEngine;

public class Enemy_Health : MonoBehaviour
{
    public int expReward = 3;

    public delegate void MonsterDefeated(int exp);
    public static event MonsterDefeated onMonsterDefeated;

    public int currentHealth;
    public int maxHealth;

    private void Start()
    {
        currentHealth = maxHealth;
    }

    public void ChangeHealth(int amount)
    {
        currentHealth += amount;
        if (currentHealth <= 0)
        {
            onMonsterDefeated?.Invoke(expReward);
            Destroy(gameObject);
        }
        else if (currentHealth > maxHealth)
        {
            currentHealth = maxHealth;
        }
    }
}
```

## 版本变更记录

| 版本 | 变更内容 |
|------|----------|
| v1 | 基本生命值管理 + 死亡事件，onMonsterDefeated 委托和事件用于通知经验系统 |
