---
date: '2026-05-31'
tags:
  - Unity
  - 脚本
  - 敌人
  - AI
  - 状态机
  - 移动
title: Enemy_Movement 敌人移动/AI 脚本
---

# Enemy_Movement 敌人移动/AI 脚本

## 这个脚本是做什么的

控制敌人的**完整 AI 行为**，包括空闲待机、追逐玩家、攻击判定、击退状态，以及在文件末尾定义了 [[#EnemyState 枚举]]。

挂载在敌人 GameObject 上，依赖 Rigidbody2D 和 Animator 组件。

> **注意**：此文件末尾还定义了 `EnemyState` 枚举，所有敌人相关脚本共享使用。

## 运行逻辑

### 变量声明

| 变量 | 类型 | 作用 |
|------|------|------|
| `Speed` | `float` | 追逐玩家时的移动速度 |
| `attackRange` | `float` | 攻击范围半径，默认 2。进入此范围则触发攻击 |
| `attackCooldown` | `float` | 攻击冷却时间（秒），默认 2 |
| `playerDetectRange` | `float` | 玩家检测范围半径，默认 5 |
| `detectionPoint` | `Transform` | 检测范围的**原点位置**（可为空，为空时使用敌人自身位置） |
| `playerLayer` | `LayerMask` | 指定玩家所在的层级，用于检测 |
| `attackCooldownTimer` | `float` | 私有，攻击冷却计时器 |
| `facingDirection` | `int` | 私有，面朝方向，1 朝右，-1 朝左 |
| `enemyState` | `EnemyState` | 私有，当前状态 |
| `rb` | `Rigidbody2D` | 私有，引用自身的刚体 |
| `player` | `Transform` | 私有，引用检测到的玩家 Transform |
| `anim` | `Animator` | 私有，引用自身的 Animator |

### Start() —— 初始化

获取自身的 Rigidbody2D 和 Animator 组件，初始状态设为 Idle。

### Update() —— 状态驱动

只有在**非击退状态**（`enemyState != EnemyState.Knockback`）时才执行：

1. 检测玩家是否在视野范围内
2. 更新攻击冷却计时器
3. 根据当前状态执行对应行为：
   - `Chasing`：调用 `Chase()` 追逐玩家
   - `Attacking`：将速度归零，停止移动

### Chase() —— 追逐

1. 检测玩家在敌人的左还是右，如果需要则翻转
2. 计算从敌人指向玩家的方向，归一化后乘以 Speed 作为速度

### Flip() —— 翻转

将 `facingDirection` 取反，localScale.x 取反。

### CheckForPlayer() —— 玩家检测（核心方法）

1. 用 `Physics2D.OverlapCircleAll` 在 `detectionPoint`（或敌人自身位置）处检测 `playerDetectRange` 范围内的玩家
2. 如果检测到玩家：
   - 记录玩家 Transform
   - 如果距离 `< attackRange` 且冷却完毕 → 切换到 `Attacking` 状态
   - 如果距离 `>= attackRange` 且不在攻击中 → 切换到 `Chasing` 状态
3. 如果没有检测到玩家：
   - 速度归零，切换到 `Idle` 状态

### ChangeState(EnemyState newState) —— 状态切换

先清除旧状态的动画参数，再设置新状态的动画参数。这样确保动画器中的布尔值互斥：
- 先将旧状态的 isXxx 设为 false
- 再更新 `enemyState` 变量
- 最后将新状态的 isXxx 设为 true

### OnDrawGizmosSelected() —— 编辑器可视化

在编辑器中选中敌人时，用红色线框绘制检测范围，方便调试。

### EnemyState 枚举

在文件末尾定义，包含四个状态：
- `Idle` —— 空闲待机
- `Chasing` —— 追逐玩家
- `Attacking` —— 攻击中
- `Knockback` —— 被击退/眩晕

## 与其他脚本的交互

- [[脚本_Enemy_Combat\|Enemy_Combat]]：当状态为 Attacking 时，通过 Animation Event 调用其 `Attack()` 方法
- [[脚本_Enemy_Knockback\|Enemy_Knockback]]：调用本脚本的 `ChangeState(EnemyState.Knockback)` 切换为击退状态
- [[脚本_Enemy_Health\|Enemy_Health]]：敌人死亡时销毁 GameObject

## 设计要点：detectionPoint 的灵活性

`detectionPoint` 是一个 Transform 引用，可以将其赋值为敌人的头部、眼睛或其他位置。这样即使敌人的碰撞体在脚部，检测范围也可以从头部开始计算，更加灵活。如果未赋值，则默认使用敌人自身的 transform.position。

## 完整代码

```csharp
using UnityEngine;

public class Enemy_Movement : MonoBehaviour
{
    public float Speed;
    public float attackRange = 2;
    public float attackCooldown = 2;
    public float playerDetectRange = 5;
    public Transform detectionPoint;
    public LayerMask playerLayer;

    private float attackCooldownTimer;
    private int facingDirection = 1;
    private EnemyState enemyState;

    private Rigidbody2D rb;
    private Transform player;
    private Animator anim; 

    void Start()
    {
        rb = GetComponent<Rigidbody2D>();
        anim = GetComponent<Animator>();
        ChangeState(EnemyState.Idle);
    }

    void Update()
    {
        if (enemyState != EnemyState.Knockback)
        {
            CheckForPlayer();

            if (attackCooldownTimer > 0)
            {
                attackCooldownTimer -= Time.deltaTime;
            }

            if (enemyState == EnemyState.Chasing)
            {
                Chase();
            }
            else if (enemyState == EnemyState.Attacking)
            {
                rb.linearVelocity = Vector2.zero;
            }
        }
    }

    void Chase()
    {
        if (player.position.x > transform.position.x && facingDirection == -1 ||
                player.position.x < transform.position.x && facingDirection == 1)
        {
            Flip();
        }

        Vector2 direction = (player.position - transform.position).normalized;
        rb.linearVelocity = direction * Speed;
    } 

    void Flip()
    {
        facingDirection *= -1;
        transform.localScale = new Vector3(-transform.localScale.x, transform.localScale.y, transform.localScale.z);
    }

    private void CheckForPlayer()
    {
        Vector2 detectOrigin = detectionPoint != null ? detectionPoint.position : transform.position;
        Collider2D[] hits = Physics2D.OverlapCircleAll(detectOrigin, playerDetectRange, playerLayer);
        
        if (hits.Length > 0)
        {
            player = hits[0].transform; 

            if (Vector2.Distance(transform.position, player.position) < attackRange && attackCooldownTimer <= 0)
            {
                attackCooldownTimer = attackCooldown;
                ChangeState(EnemyState.Attacking);
            }

            else if (Vector2.Distance(transform.position, player.position) > attackRange && enemyState != EnemyState.Attacking)
            {
                ChangeState(EnemyState.Chasing);
            }
        }
        else
        {
            rb.linearVelocity = Vector2.zero;
            ChangeState(EnemyState.Idle);
        }
    }

    public void ChangeState(EnemyState newState)
    {
        if (enemyState == EnemyState.Idle)
            anim.SetBool("isIdle", false);
        else if (enemyState == EnemyState.Chasing)
            anim.SetBool("isChasing", false);
        else if (enemyState == EnemyState.Attacking)
            anim.SetBool("isAttacking", false);
        else if (enemyState == EnemyState.Knockback)
            anim.SetBool("isKnockback", false);

        enemyState = newState;
        if (enemyState == EnemyState.Idle)
            anim.SetBool("isIdle", true);
        else if (enemyState == EnemyState.Chasing)
            anim.SetBool("isChasing", true);
        else if (enemyState == EnemyState.Attacking)
            anim.SetBool("isAttacking", true);
        else if (enemyState == EnemyState.Knockback)
            anim.SetBool("isKnockback", true);
    }

    private void OnDrawGizmosSelected()
    {
        Vector3 gizmoOrigin = detectionPoint != null ? detectionPoint.position : transform.position;
        Gizmos.color = Color.red;
        Gizmos.DrawWireSphere(gizmoOrigin, playerDetectRange);
    }
}

public enum EnemyState
{
    Idle,
    Chasing,
    Attacking,
    Knockback,
}
```

## 版本变更记录

| 版本 | 变更内容 |
|------|----------|
| v1 | 使用 Circle Collider 2D + OnTriggerEnter 检测玩家（基于碰撞体的检测方式） |
| v2 | 改用代码检测（Physics2D.OverlapCircleAll）+ 状态机结构 |
| v3 | 添加攻击冷却和攻击状态，敌人不会无限攻击 |
| v4 | 添加 Knockback 状态，与 [[脚本_Enemy_Knockback\|Enemy_Knockback]] 配合使用 |
