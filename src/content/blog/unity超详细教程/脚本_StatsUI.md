---
date: '2026-05-31'
tags:
  - Unity
  - 脚本
  - UI
  - 属性面板
  - 暂停
title: StatsUI 属性面板脚本
series: unity超详细教程
seriesTitle: unity超详细教程
---

# StatsUI 属性面板脚本

## 这个脚本是做什么的

管理游戏的**属性面板 UI**，按下特定按键时打开/关闭面板。面板打开时会**暂停游戏**（Time.timeScale = 0），关闭时恢复。

挂载在属性面板的根 GameObject 上。

## 运行逻辑

### 变量声明

| 变量 | 类型 | 作用 |
|------|------|------|
| `statsSlots` | `GameObject[]` | 属性槽位数组，每个槽位包含一个 TMP_Text 子对象用于显示属性文本 |
| `statsCanvasGroup` | `CanvasGroup` | 面板的 CanvasGroup 组件，通过修改 alpha 控制显隐 |
| `statsOpen` | `bool` | 私有状态标记，面板是否打开 |

### Start() —— 初始化

调用 `UpdateAllStats()` 将所有属性的当前值显示在 UI 上。

### Update() —— 开关面板

每帧检测是否按下 `ToggleStats` 按钮（需要在 Project Settings 中配置该输入轴）：

**打开面板时：**
- `Time.timeScale = 0` → 游戏暂停（FixedUpdate 和 Update 中的 Time.deltaTime 不受影响的对象也会暂停）
- `statsCanvasGroup.alpha = 1` → 面板可见
- `statsOpen = true`

**关闭面板时：**
- `Time.timeScale = 1` → 游戏恢复正常速度
- 调用 `UpdateAllStats()` 刷新数据（防止面板打开期间数值变化）
- `statsCanvasGroup.alpha = 0` → 面板隐藏
- `statsOpen = false`

### UpdateDamage() / UpdateSpeed()

分别更新数组中对应槽位的文本。`statsSlots[0]` 显示伤害，`statsSlots[1]` 显示速度。

### UpdateAllStats()

同时调用 `UpdateDamage()` 和 `UpdateSpeed()`，在打开面板和 Start 时刷新所有属性。

## 关于 Time.timeScale = 0 暂停

- 设置 `Time.timeScale = 0` 后，`Time.deltaTime` 变为 0
- 依赖 Time.deltaTime 的 Update 逻辑会暂停（如冷却计时、敌人移动）
- 但是 `Input.GetButtonDown()` 仍然正常工作（它不依赖 Time.timeScale）
- 不受 `Time.timeScale` 影响的只有：独立于 Time.deltaTime 的协程（如 `WaitForSecondsRealtime`）、以及音频和粒子系统的某些设置

## 与其他脚本的交互

- [[脚本_StatsManager\|StatsManager]]：读取 `damage` 和 `speed` 显示在 UI 上
- [[脚本_Player_Combat\|Player_Combat]]：攻击后调用 `statsUI.UpdateDamage()` 刷新伤害显示

## 完整代码

```csharp
using UnityEngine;
using TMPro;

public class StatsUI : MonoBehaviour
{
    public GameObject[] statsSlots;
    public CanvasGroup statsCanvasGroup;

    private bool statsOpen = false;

    private void Start()
    {
        UpdateAllStats();
    }

    private void Update()
    {
        if (Input.GetButtonDown("ToggleStats"))
            {
            if (statsOpen)
            {
                Time.timeScale = 1;
                UpdateAllStats();
                statsCanvasGroup.alpha = 0;
                statsOpen = false;
            }
            else 
            {
                Time.timeScale = 0;
                statsCanvasGroup.alpha = 1;
                statsOpen = true;
            }
        }
    }

    public void UpdateDamage()
    {
        statsSlots[0].GetComponentInChildren<TMP_Text>().text = "Damage : " + StatsManager.instance.damage;
    }
    public void UpdateSpeed()
    {
        statsSlots[1].GetComponentInChildren<TMP_Text>().text = "Speed : " + StatsManager.instance.speed;
    }
    public void UpdateAllStats()
    {
        UpdateDamage();
        UpdateSpeed();
    }
}
```

## 版本变更记录

| 版本 | 变更内容 |
|------|----------|
| v1 | 基本属性面板：Toggle 切换显隐，显示伤害和速度两项数值 |
| v2 | 添加游戏暂停：打开面板时 Time.timeScale = 0，关闭时恢复 |
