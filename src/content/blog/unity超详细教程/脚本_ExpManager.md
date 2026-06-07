---
date: '2026-05-31'
tags:
  - Unity
  - 脚本
  - 经验
  - 升级
  - UI
title: ExpManager 经验管理器脚本
series: unity超详细教程
seriesTitle: unity超详细教程
---

# ExpManager 经验管理器脚本

## 这个脚本是做什么的

管理整个游戏的**经验值和升级系统**：击败敌人获得经验、积累到一定量时升级、升级后需求经验增长、实时更新 UI。

挂载在一个管理 GameObject 上。

## 运行逻辑

### 变量声明

| 变量 | 类型 | 说明 |
|------|------|------|
| `level` | `int` | 当前等级 |
| `currentExp` | `int` | 当前已获得的经验值 |
| `expToLevel` | `int` | 当前等级升级所需经验值，初始 10 |
| `expGrowthMultiplier` | `float` | 每次升级后需求经验的增长率，默认 1.2 |
| `expSlider` | `Slider` | 经验条 UI Slider |
| `currentLevelText` | `TMP_Text` | 等级文本 UI，显示 "Level : 当前等级" |

还有一个**静态事件**：
```csharp
public static event System.Action<int> onMonsterDefeated;
```
这个是备用事件，目前其他脚本未使用。实际经验获取是通过 [[脚本_Enemy_Health\|Enemy_Health]] 的 `onMonsterDefeated` 事件触发的。

### Start() —— 初始化

调用 `UpdateUI()` 显示初始等级和经验值。

### Update() —— 调试用

每帧检测是否按下 Enter 键，按下则调用 `GainExperience(2)` 增加 2 点经验。这个方法是**调试用的**，方便测试升级系统而不用实际打怪。

### OnEnable() / OnDisable() —— 事件订阅

```csharp
private void OnEnable()
{
    Enemy_Health.onMonsterDefeated += GainExperience;
}

private void OnDisable()
{
    Enemy_Health.onMonsterDefeated -= GainExperience;
}
```

- `OnEnable()`：当脚本启用时，订阅 [[脚本_Enemy_Health\|Enemy_Health]] 的 `onMonsterDefeated` 静态事件
- `OnDisable()`：当脚本禁用时，取消订阅

### GainExperience(int amount) —— 获取经验

1. 将传入的 `amount` 累加到 `currentExp`
2. **使用 while 循环检查是否达到升级条件**：只要 `currentExp >= expToLevel`，就不断调用 `LevelUp()`。这支持**连续升级**场景（比如获得大量经验一次升多级）
3. 调用 `UpdateUI()` 刷新显示

### LevelUp() —— 升级

1. 等级 +1
2. 将 `currentExp` 减去当前等级的 `expToLevel`（注意：溢出经验保留到下一级）
3. 将 `expToLevel` 乘以 `expGrowthMultiplier` 并四舍五入取整

例如：
- 初始：level=0, expToLevel=10
- 获得 25 经验后：
  - 第 1 次升级：level=1, currentExp=15(25-10), expToLevel=12(10×1.2)
  - 第 2 次升级：level=2, currentExp=3(15-12), expToLevel=14(12×1.2≈14)
  - 退出 while 循环（3 < 14）

### UpdateUI() —— 更新 UI

将 `expSlider` 的 `maxValue` 设为 `expToLevel`、`value` 设为 `currentExp`，更新等级文本。

## while 循环支持连续升级

关键设计点在于：
```csharp
while (currentExp >= expToLevel)
{
    LevelUp();
}
```
使用 `while` 而非 `if`，确保如果一次获得的经验足够升多级时，会连续升级直到经验不足。如果使用 `if`，升到下一级后即使经验还够也不会继续升级，需要再获得一点经验才能触发下一次检测。

## 与其他脚本的交互

- [[脚本_Enemy_Health\|Enemy_Health]]：订阅其 `onMonsterDefeated` 事件，敌人死亡时自动获得经验
- [[脚本_StatsUI\|StatsUI]]：经验 UI 与属性面板 UI 分离，各自独立管理

## 完整代码

```csharp
using UnityEngine;
using UnityEngine.UI;
using TMPro;

public class ExpManager : MonoBehaviour
{
    public static event System.Action<int> onMonsterDefeated;

    public int level;
    public int currentExp;
    public int expToLevel = 10;
    public float expGrowthMultiplier = 1.2f;
    public Slider expSlider;
    public TMP_Text currentLevelText;

    private void Start()
    {
        UpdateUI();
    }

    public void Update()
    {
        if(Input.GetKeyDown(KeyCode.Return))
        {
            GainExperience(2);
        }
    } 

    private void OnEnable()
    {
        Enemy_Health.onMonsterDefeated += GainExperience;
    }

    private void OnDisable()
    {
        Enemy_Health.onMonsterDefeated -= GainExperience;
    }

    public void GainExperience(int amount)
    {
        currentExp += amount;
        while (currentExp >= expToLevel)
        {
            LevelUp();
        }
        UpdateUI();
    }

    private void LevelUp()
    {
        level++;
        currentExp -= expToLevel;
        expToLevel = Mathf.RoundToInt(expToLevel * expGrowthMultiplier);
    }

    public void UpdateUI()
    {
        expSlider.maxValue = expToLevel;
        expSlider.value = currentExp;
        currentLevelText.text = "Level : " + level;
    }
}
```

## 版本变更记录

| 版本 | 变更内容 |
|------|----------|
| v1 | 基本经验系统：经验获取、升级、UI 更新 |
| v2 | 添加 Enter 键调试功能：按回车获得 2 点经验 |
