---
date: '2026-05-31'
title: UI 制作与血条
series: unity超详细教程
seriesTitle: unity超详细教程
---

# UI 制作与血条

---

## 创建画布（Canvas）

1. 在 Hierarchy 中右键 → **UI** → **Image**
2. Unity 会自动创建一个 Canvas（画布）以及一个 EventSystem

### 画布的逻辑

- **所有的 UI 都是画在画布上的**，画布本身没有实际的位置概念
- 画布显得很大，是因为 Unity 里的一米在画布上渲染为一个像素，所以画布看起来像超级大的平面
- 在同一个画布下可以创建多个 Image，每个 Image 可以放入一个精灵图
- 如果需要多个精灵图拼起来组成一个 UI，可以新建一个空物体作为父物体，在下方创建多个子物体。子物体按照与父物体的相对位置进行摆放，只要单独设置父物体相对于画布的位置，也就设置了整个 UI 的位置

---

## Canvas Scaler 设置

为了让 UI 在不同分辨率下都能正常显示，需要设置 Canvas Scaler 组件：

1. 选中 Canvas 对象
2. 在 Inspector 中找到 **Canvas Scaler** 组件
3. **UI Scale Mode**：选择 `Scale With Screen Size`（随屏幕大小自适应）
4. 下方输入你的目标分辨率（比如 1920 x 1080）
5. **Screen Match Mode**：当分辨率宽高比例和设定不符时，以什么为准？
   - **横屏游戏**（高度固定，宽度自适应）：将 Match 滑块拉到最右侧，输入 **`1`**
   - **竖屏游戏**（宽度固定，高度自适应）：将滑块拉到最左侧，输入 **`0`**
   - 如果想取一个平衡，可以尝试 **`0.5`**
   - 调节滑块的瞬间，Scene 视图中代表 Canvas 的矩形框会立即响应

---

## Rect Transform 位置设置

- 在 Rect Transform 组件中，左边有一个方框，点击可以选择锚点（中心位置）
- **长按 Alt** 点击可以选择整体位置（同时设置锚点和自身位置）
- 如果有父物体，锚点位置是相对于父物体的；如果没有父物体，就是相对于画布的位置

---

## Image 组件设置

- 在 Image 组件的第一项 **Source Image** 中拖入精灵图即可显示
- **层级遮挡**：在 Hierarchy 中靠下的 Image 会覆盖靠上的 Image，因此内部填充血条要放置在靠下的位置（让它显示在边框的上层）

---

## 九宫格在 UI 中的应用

UI Image 支持九宫格拉伸。如果你设置了精灵图的 Border（绿框）：

1. 选中 Image，在 Inspector 中找到 Image 组件
2. 将 **Image Type** 从 `Simple` 改为 **`Sliced`**
3. 此时用 Rect Tool 拉伸图片，四角保持不变，只有中心被拉伸

关于九宫格的详细说明请见 [[Sprite与九宫格]]。

---

## 血条制作

### 使用 Filled 模式

1. 创建多个 UI Image，分别放入切好的血条边框和填充图片
2. 选中填充用的 Image，在 Image 组件中：
   - **Image Type**：选择 `Filled`（填充模式）
   - **Fill Method**：选择 `Horizontal`（水平填充方式）
   - **Fill Origin**：选择 `Left`（从左向右填充）
3. 下方的进度条可以拖动预览效果

### 血条文本（TextMeshPro）

1. 需要先安装 TextMeshPro 包（通过 Package Manager，参考 [[Package包管理器]]）
2. 在 Hierarchy 中右键 → **UI** → **Text - TextMeshPro**，命名为 `HP Text`
3. 在 **Text Input** 中输入文字内容
4. 下方可以选择字体格式
5. **Main Settings** 中：
   - **Font Asset**：选择字体文件
   - **Font Size**：设置字号大小
6. **Animator** 中的 **Underlay** 可以设置文字阴影
7. 文本本身也属于 UI，位置逻辑和上述一致

### 文字显示格式

在脚本中控制文字内容，显示格式为 `HP : current / max`：

```csharp
healthText.text = "HP : " + currentHealth + " / " + maxHealth;
```

---

## 血条跳跃动画

给血条文字添加一个缩放的动画效果，让血量变化时有视觉反馈。

### 制作步骤

1. 选中 `HP Text`，打开 Animation 窗口（Window → Animation → Animation）
2. 选择存储位置，创建一个新的动画片段（比如 "TextUpdate"）
3. 点击**录制按钮**（红色圆点）
4. 在时间轴上点击需要添加关键帧的时间点
5. 直接在 Scene 或 Inspector 中修改文字的大小等信息，会自动生成一个关键帧
6. 复制初始帧，在时间轴上选中需要粘贴的时间点，粘贴
7. 这样一段"放大→恢复"的缩放动画就做好了

### Animator 设置

1. 打开动画控制器（Animator）
2. 设置好初始待机动画状态
3. 创建从待机到跳跃动画的过渡
4. 选中跳跃动画，取消勾选 **Loop Time**（取消循环），这样动画只播放一次

### 代码控制

在生命值脚本中添加动画控制：

```csharp
public Animator healthTextAnim;

public void ChangeHealth(int amount)
{
    currentHealth += amount;
    healthTextAnim.Play("TextUpdate");
    healthText.text = "HP : " + currentHealth + " / " + maxHealth;
    
    if (currentHealth <= 0)
    {
        gameObject.SetActive(false);  // 游戏结束，隐藏玩家
    }
}
```

回到 Unity 中，在玩家对象对应的组件里将动画对象 UI（`HP Text`）拖入脚本的动画接口位置。

---

## 补充：插值变化（Lerp）的概念

你可能会看到一些游戏的血条是"慢慢减少"而不是"瞬间跳变"的，这背后用的是**插值（Lerp）**。

**不用插值（跳变）**：血量从 100 直接变成 50，血条"唰"一下短了一截。
**用插值（渐变）**：血量从 100，每一帧都计算一个中间值，比如 99.5、98.2、95.1……慢慢过渡到 50，血条平滑地缩短。

具体实现通常有两种插值配合：
- **数值文字**：从 100 逐渐跳字变成 50
- **填充条本身**：先瞬间改变颜色（表示受伤），然后填充量再平滑缩短

这种"先受伤反馈，后平滑扣除"的组合，就是血条手感的精髓。

---

## 延伸阅读

- [[Sprite与九宫格]] — 绿框 Border 的设置和 Sliced 模式
- [[动画状态机逻辑]] — 血条动画的过渡规则
- [[脚本_PlayerHealth]] — 生命值脚本的详细说明
