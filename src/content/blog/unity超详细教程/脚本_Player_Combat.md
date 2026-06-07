---
date: '2026-05-31'
tags:
  - Unity
  - 脚本
  - 玩家
  - 战斗
  - 攻击
title: Player_Combat 玩家战斗脚本
---

# Player_Combat 玩家战斗脚本

## 这个脚本是做什么的

管理玩家的**攻击系统**，包括攻击冷却、伤害判定、与敌人交互。核心机制是通过 **Animation Event（动画事件）** 在动画的特定帧调用 `DealDamage()` 方法，实现"动画播放到挥刀帧时才造成伤害"的效果。

挂载在玩家 GameObject 上。

## 运行逻辑

### 变量声明

| 变量 | 类型 | 作用 |
|------|------|------|
| `anim` | `Animator` | 引用自身的 Animator，控制攻击动画状态 |
| `attackPoint` | `Transform` | 攻击判定的原点位置（通常是武器末端或玩家前方） |
| `enemyLayer` | `LayerMask` | 指定哪些层级被视为"敌人"，用于攻击检测 |
| `statsUI` | `StatsUI` | 引用 [[脚本_StatsUI\|StatsUI]]，攻击后更新伤害显示 |
| `cooldown` | `float` | 攻击冷却时间（秒），默认 2 秒 |
| `timer` | `float` | 私有计时器，记录剩余冷却时间 |

### Update() —— 冷却计时

每帧如果 `timer > 0`，就减去 `Time.deltaTime`。当 `timer <= 0` 时玩家才能再次攻击。

### Attack() —— 触发攻击

由 [[脚本_PlayerMovement\|PlayerMovement]] 的 Update() 调用。如果 `timer <= 0`：
1. 设置 Animator 参数 `isAttacking = true`，播放攻击动画
2. 将 `timer` 重置为 `cooldown`，进入冷却

### DealDamage() —— 造成伤害（Animation Event 调用）

这是**由动画事件调用的方法**，在攻击动画的特定帧通过 Animation Event 触发：
1. 每次攻击伤害 +1：`StatsManager.instance.damage += 1`（伤害递增机制）
2. 更新 StatsUI 的伤害显示
3. 用 `Physics2D.OverlapCircleAll` 以 `attackPoint` 为中心、`weaponRange` 为半径，检测 `enemyLayer` 上的所有碰撞体
4. 对每个检测到的敌人：
   - 调用 `Enemy_Health.ChangeHealth(-StatsManager.instance.damage)` 扣血
   - 调用 `Enemy_Knockback.Knockback(...)` 击退

### FinishAttacking() —— 攻击结束（Animation Event 调用）

由动画事件在攻击动画播放完毕时调用，将 `isAttacking` 设回 false。

### OnDrawGizmosSelected() —— 编辑器可视化

在编辑器中选中该物体时，用红色线框绘制攻击范围，方便调试。

## 核心设计：Animation Event 机制

- 在攻击动画的特定帧（如武器挥到一半时）添加 Animation Event
- Event 函数名为 `DealDamage()`（即调用本类的 `DealDamage` 方法）
- 在动画结尾添加另一个 Event，函数名为 `FinishAttacking()`
- 这样伤害判定和动画是同步的，不会出现"动画还没挥刀但伤害已经打出了"的问题

## 与其他脚本的交互

- [[脚本_PlayerMovement\|PlayerMovement]]：调用本脚本的 `Attack()` 方法
- [[脚本_StatsManager\|StatsManager]]：读取 `damage`、`weaponRange`、`knockbackForce`、`knockbackTime`、`stunTime`
- [[脚本_StatsUI\|StatsUI]]：攻击后调用 `statsUI.UpdateDamage()` 刷新 UI
- [[脚本_Enemy_Health\|Enemy_Health]]：调用 `ChangeHealth()` 扣血
- [[脚本_Enemy_Knockback\|Enemy_Knockback]]：调用 `Knockback()` 击退敌人

## 完整代码

```csharp
using UnityEngine;

public class Player_Combat : MonoBehaviour
{
    public Animator anim;

    public Transform attackPoint;
    public LayerMask enemyLayer;
    public StatsUI statsUI;

    public float cooldown = 2;
    private float timer;

    private void Update()
    {
        if (timer > 0)
        {
            timer -= Time.deltaTime;
        }
    }
    
    public void Attack()
    {
        if (timer <= 0)
        {
            anim.SetBool("isAttacking", true);
            timer = cooldown;
        }
    }

    public void DealDamage()
    {
        StatsManager.instance.damage += 1;
        statsUI.UpdateDamage();
        Collider2D[] enemies = Physics2D.OverlapCircleAll(attackPoint.position, StatsManager.instance.weaponRange, enemyLayer);
        foreach (Collider2D enemy in enemies)
        {
            enemy.GetComponent<Enemy_Health>().ChangeHealth(-StatsManager.instance.damage);
            enemy.GetComponent<Enemy_Knockback>().Knockback(transform.position, StatsManager.instance.knockbackForce, StatsManager.instance.knockbackTime, StatsManager.instance.stunTime);
        }
    }

    public void FinishAttacking()
    {
        anim.SetBool("isAttacking", false);
    }

    private void OnDrawGizmosSelected()
    {
        Gizmos.color = Color.red;
        Gizmos.DrawWireSphere(attackPoint.position, StatsManager.instance.weaponRange);
    }
}
```

## 版本变更记录

| 版本 | 变更内容 |
|------|----------|
| v1 | 基本攻击系统：通过 OverlapCircleAll 检测敌人，调用敌人脚本扣血和击退 |
| v2 | 添加冷却系统：cooldown + timer，防止攻击过于频繁 |
| v3 | Animation Event 机制：DealDamage() 和 FinishAttacking() 由动画事件驱动，而非直接调用 |
| v4 | 添加伤害递增：每次攻击 `StatsManager.instance.damage += 1` |
| v5 | 添加 StatsUI 联动：攻击后刷新属性面板 |
