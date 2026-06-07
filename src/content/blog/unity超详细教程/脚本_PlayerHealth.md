---
date: '2026-05-31'
tags:
  - Unity
  - 脚本
  - 玩家
  - 生命值
  - UI
title: PlayerHealth 玩家生命值脚本
series: unity超详细教程
seriesTitle: Unity超详细教程
seriesSection: 脚本
seriesOrder: 102.0
---

# PlayerHealth 玩家生命值脚本

## 这个脚本是做什么的

管理玩家的**生命值系统**，包括受伤扣血、治疗加血、UI 更新（血量条和文本）以及死亡处理。

挂载在玩家 GameObject 上。

## 运行逻辑

### 变量声明

| 变量 | 类型 | 作用 |
|------|------|------|
| `bar` | `Image` | 血条 UI（Slider 或 Image），通过 fillAmount 控制血量显示 |
| `healthText` | `TMP_Text` | 血量文本 UI，显示 "HP : 当前值 / 最大值" |
| `healthTextAnim` | `Animator` | 血量文本的动画控制器，更新时播放 "TextUpdate" 动画 |

### Start() —— 初始化 UI

将血量文本设为 `StatsManager.instance` 中的 `currentHealth` 和 `maxHealth`。

### ChangeHealth(int amount) —— 改变生命值

由外部调用（如 [[脚本_Enemy_Combat\|Enemy_Combat]] 攻击玩家时）：
1. 修改 `StatsManager.instance.currentHealth += amount`
   - `amount` 为正数 = 治疗，为负数 = 受伤
2. 播放血量文本的 "TextUpdate" 动画（如闪烁或缩放效果）
3. 更新血条 fillAmount = 当前血量 / 最大血量
4. 更新血量文本
5. 如果 `currentHealth <= 0`，隐藏玩家 GameObject（`SetActive(false)`），实现死亡效果

### 关于血量和 StatsManager

血量数值不再存储在 PlayerHealth 中，而是统一存储在 [[脚本_StatsManager\|StatsManager]] 的单例中。这样做的好处是其他脚本（如敌人攻击）可以直接修改血量，而无需先获取 PlayerHealth 组件。

## 与其他脚本的交互

- [[脚本_StatsManager\|StatsManager]]：读取/修改 `currentHealth` 和 `maxHealth`
- [[脚本_Enemy_Combat\|Enemy_Combat]]：敌人攻击时调用本脚本的 `ChangeHealth(-damage)`
- [[脚本_Elevation_Entry_Exit\|Elevation_Entry / Exit]]：进入/退出高地时修改玩家 SpriteRenderer 的 sortingOrder

## 完整代码

```csharp
using UnityEngine;
using UnityEngine.UI;
using TMPro;

public class PlayerHealth : MonoBehaviour
{

    public Image bar;

    public TMP_Text healthText;
    public Animator healthTextAnim;

    private void Start()
    {
        healthText.text = "HP : " + StatsManager.instance.currentHealth + " / " + StatsManager.instance.maxHealth;
    }

    public void ChangeHealth(int amount)
    {
        StatsManager.instance.currentHealth += amount;
        healthTextAnim.Play("TextUpdate");
        bar.fillAmount = (float)StatsManager.instance.currentHealth / StatsManager.instance.maxHealth;
        healthText.text = "HP : " + StatsManager.instance.currentHealth + " / " + StatsManager.instance.maxHealth;

        if (StatsManager.instance.currentHealth <= 0)
        {
            gameObject.SetActive(false);
        }
    }
}
```

## 版本变更记录

| 版本 | 变更内容 |
|------|----------|
| v1 | 本地变量存储血量，直接在 PlayerHealth 中声明 currentHealth 和 maxHealth |
| v2 | 血量迁移到 StatsManager 统一管理，PlayerHealth 只负责 UI 展示和逻辑处理 |
