---
date: '2026-05-31'
tags:
  - Unity
  - 脚本
  - 玩家
  - 移动
  - 击退
title: PlayerMovement 玩家移动脚本
series: unity超详细教程
seriesTitle: unity超详细教程
---

# PlayerMovement 玩家移动脚本

## 这个脚本是做什么的

控制玩家的**移动、翻转、击退**以及**攻击输入**。挂载在玩家 GameObject 上，依赖 Rigidbody2D 和 Animator 组件。

## 运行逻辑

### 变量声明

| 变量 | 类型 | 作用 |
|------|------|------|
| `facingDirection` | `int` | 面朝方向，1 朝右，-1 朝左。初始为 1 |
| `rb` | `Rigidbody2D` | 引用自身的 Rigidbody2D，用于物理移动 |
| `anim` | `Animator` | 引用自身的 Animator，控制移动动画参数 |
| `isKnockedBack` | `bool` | 是否处于击退状态。击退期间禁用玩家输入移动 |
| `player_Combat` | `Player_Combat` | 引用同物体的 [[脚本_Player_Combat\|Player_Combat]]，用于触发攻击 |

### Update() —— 攻击输入检测

每帧检测是否按下 `Slash` 按钮（Project Settings 中配置，默认映射尚未设置，需手动绑定），按下时调用 `player_Combat.Attack()`。

### FixedUpdate() —— 移动逻辑（固定时间步长）

只有在 `isKnockedBack == false`（未被击退）时才能移动：

1. 通过 `Input.GetAxis("Horizontal")` 和 `Input.GetAxis("Vertical")` 获取水平和垂直输入值（范围 -1~1）
2. 翻转检测：如果水平输入方向与当前面朝方向相反，调用 `Flip()`
3. 将水平和垂直输入值（取绝对值）传给 Animator 的 `horizontal` 和 `vertical` 参数，驱动混合树动画
4. 设置刚体速度：`rb.linearVelocity = new Vector2(horizontal * speed, vertical * speed)`

### Flip() —— 翻转

将 `facingDirection` 乘以 -1，然后将 transform.localScale 的 x 设为 `facingDirection`（y 和 z 保持不变），实现角色左右翻转。

### Knockback() —— 击退

由敌人调用（如 [[脚本_Enemy_Combat\|Enemy_Combat]] 的攻击方法）：
1. 将 `isKnockedBack` 设为 true，禁用玩家输入移动
2. 计算从敌人指向玩家的方向向量，归一化后乘以 force 作为击退速度
3. 启动协程 `KnockbackCounter(stunTime)`

### KnockbackCounter() 协程

1. 等待 `StatsManager.instance.knockbackTime` 秒（击退持续时间）
2. 将刚体速度归零
3. 将 `isKnockedBack` 设为 false，恢复玩家控制

## 与其他脚本的交互

- [[脚本_Player_Combat\|Player_Combat]]：`Update()` 中触发攻击
- [[脚本_StatsManager\|StatsManager]]：协程中读取 `knockbackTime`
- [[脚本_Enemy_Combat\|Enemy_Combat]]：敌人攻击时调用本脚本的 `Knockback()` 方法
- [[脚本_PlayerHealth\|PlayerHealth]]：敌人攻击同时会调用 PlayerHealth.ChangeHealth() 扣血

## 完整代码

```csharp
using UnityEngine;
using System.Collections;

public class PlayerMovement : MonoBehaviour
{

    public int facingDirection = 1;


    public Rigidbody2D rb;
    public Animator anim;

    private bool isKnockedBack;

    public Player_Combat player_Combat;

    private void Update()
    {
        if (Input.GetButtonDown("Slash"))
        {
            player_Combat.Attack();
        }
    }


    void FixedUpdate()
    {
        if (isKnockedBack == false)
        {
            float horizontal = Input.GetAxis("Horizontal");
            float vertical = Input.GetAxis("Vertical");

            if (horizontal > 0 && facingDirection < 0 ||
                horizontal < 0 && facingDirection > 0)
                {
                    Flip();
                }

            anim.SetFloat("horizontal", Mathf.Abs(horizontal));
            anim.SetFloat("vertical", Mathf.Abs(vertical));

            // ⚠️ 注意：此处 speed 变量未在本类中声明
            // 正确写法应为 StatsManager.instance.speed
            // 当前代码会导致编译错误，需要手动修正
            rb.linearVelocity = new Vector2(horizontal * speed, vertical * speed);
        }
    }

    void Flip()
    {
        facingDirection *= -1;
        transform.localScale = new Vector3(facingDirection, transform.localScale.y, transform.localScale.z);
    }

    public void Knockback(Transform enemy, float force, float stunTime)
    {
        isKnockedBack = true;
        Vector2 direction = (transform.position - enemy.position).normalized;
        rb.linearVelocity = direction * force;
        StartCoroutine(KnockbackCounter(stunTime));
    }

    IEnumerator KnockbackCounter(float stunTime)
    {
        yield return new WaitForSeconds(StatsManager.instance.knockbackTime);
        rb.linearVelocity = Vector2.zero;
        isKnockedBack = false;
    }
}
```

## 版本变更记录

| 版本 | 变更内容 |
|------|----------|
| v1 | 基本移动功能：通过 Input.GetAxis 获取输入，直接设置 Rigidbody2D 速度 |
| v2 | 添加翻转功能：Flip() 方法，通过修改 localScale.x 实现角色左右转向 |
| v3 | 添加动画：引入 Animator，根据移动输入设置 horizontal/vertical 参数 |
| v4 | 添加击退和眩晕：Knockback() 方法和 KnockbackCounter() 协程，被击退时禁用玩家控制 |
| v5 | 添加攻击输入：Update() 中检测 Slash 按钮，调用 Player_Combat.Attack() |
| v6 | speed 迁移到 StatsManager：但代码中仍写为 `* speed`，这是一个编译错误。**需要改为 `* StatsManager.instance.speed`** |
