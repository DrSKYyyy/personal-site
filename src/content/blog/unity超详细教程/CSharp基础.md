---
date: '2026-05-31'
title: C# 基础与 MonoBehaviour
---

# C# 基础与 MonoBehaviour

在 Unity 中编写脚本，本质上是在用 C# 语言给游戏对象"赋予行为"。本文档会带你了解 Unity 脚本编程中最核心的概念。

---

## MonoBehaviour 是什么？

当你创建一个新的 C# 脚本时，默认生成的代码是这样的：

```csharp
using UnityEngine;

public class PlayerMovement : MonoBehaviour
{
    // Start is called before the first execution of Update
    void Start() { }
    // Update is called once per frame
    void Update() { }
}
```

关键点在于类名后面那个 `: MonoBehaviour`。

**MonoBehaviour** 是 Unity 中最标准的"组件脚本"基类。任何继承自 `MonoBehaviour` 的类都：
- 可以作为一个组件挂载到 GameObject 上
- 自带 `Start()`、`Update()` 等生命周期方法
- 在 Inspector 面板中暴露公共变量

**类比理解**：MonoBehaviour 是你游戏里所有"演员"和"零件"的**灵魂蓝图**。你想让一个物体动、转、碰到东西有反应，就用它。创建后能直接拖到 GameObject 上，立刻成为它的一个组件。

> **何时使用**：99% 的游戏行为都需要 MonoBehaviour。比如控制主角移动、检测碰撞、开关门、播放音效等。

---

## 生命周期方法

Unity 在特定时机自动调用这些方法，你只需要在里面写逻辑就行：

### Awake（唤醒）

在脚本实例被加载时调用，**比 Start 更早**。适合做：
- 获取组件引用（`GetComponent<>()`）
- 初始化不需要依赖其他对象的数据

### Start（开始）

在 Awake 之后、第一帧 Update 之前调用。适合做：
- 初始化需要依赖其他对象已准备好的数据
- 设置初始状态

> **Awake 和 Start 的区别**：Awake 适合做"自己"的初始化，Start 适合做"需要和别人配合"的初始化。

### Update（更新）

**每帧调用一次**。帧率越高，调用次数越多。适合做：
- 检测输入（按键、鼠标等）
- 非物理的持续行为

### FixedUpdate（固定更新）

**每秒固定调用约 50 次**（默认），不依赖于帧率。适合做：
- 物理计算（移动 Rigidbody、施加力）
- 任何需要稳定时间步长的逻辑

> **为什么物理计算要用 FixedUpdate？** 因为 Update 的调用频率是不稳定的（高帧率时调用多，低帧率时调用少），如果在 Update 里做物理计算，同样的物理效果在不同电脑上表现会不一样。FixedUpdate 以固定的速度运行，物理计算结果更可靠。

---

## C# 数据类型注意事项

### 数字的字面量类型

在 C# 中，你写一个数字的时候，它的**默认类型**是有规定的：

```csharp
5     // 默认是 int（整数）
5.0   // 默认是 double（双精度浮点数）
5f    // 明确指定为 float（单精度浮点数）
5.0f  // 明确指定为 float
```

在 Unity 中，大部分数值计算（速度、位置、旋转等）都使用 **float** 类型。所以写代码时记得加 `f` 后缀：

```csharp
float speed = 5f;    // ✅ 正确
float speed = 5;     // ✅ 也可以，会自动转
float speed = 5.0;   // ❌ 错误！5.0 默认是 double，不能隐式转 float
```

---

## Vector2 （二维向量）

Vector2 是 Unity 用来表示 2D 空间中的位置、方向、速度等的结构体，包含 `x` 和 `y` 两个分量。

### 常用静态属性

```csharp
Vector2.zero    // (0, 0)  - 零向量，表示"没有移动"
Vector2.one     // (1, 1)  - 对角线方向
Vector2.up      // (0, 1)  - 向上
Vector2.down    // (0, -1) - 向下
Vector2.left    // (-1, 0) - 向左
Vector2.right   // (1, 0)  - 向右
```

### 为什么要初始化

写 `Vector2 inputVector = Vector2.zero;` 是为了：
- 初始化变量，避免使用未定义的值
- 确保没有按键时，向量为 (0, 0)

---

## 向量归一化（normalized）

### 为什么会需要归一化？

假设玩家按下了**右方向键**（x=1, y=0），速度是 5。那么水平移动速度是 `1 × 5 = 5`。

但如果玩家按下了**右上方向**（同时按右和上），输入的原始向量是 `(1, 1)`。这个向量的**长度**是 √(1²+1²) ≈ 1.414。如果不做处理的话，斜向移动速度就会变成 `1.414 × 5 ≈ 7.07`，比直着走快很多。

### 归一化解决什么问题？

归一化就是把一个向量的**长度变成 1**，但**方向保持不变**。`(1, 1)` 归一化后变成 `(0.707, 0.707)`，长度刚好为 1。这样：

```csharp
Vector2 movement = inputVector.normalized * speed;
```

无论你朝哪个方向走，最终移动速度都是 `speed`，斜着走和直着走速度完全一致。

---

## 公共变量与 Inspector 接口

在 MonoBehaviour 脚本中声明 `public` 变量后，这个变量会**自动出现在 Inspector 面板**中：

```csharp
public float speed = 5f;
public Rigidbody2D rb;
```

你可以在 Inspector 里直接修改数值，或者把其他组件/对象拖拽进接口位置。这是 Unity 最核心的"可视化+反射"机制。

如果你不希望某个公共变量在 Inspector 中显示，可以用 `[HideInInspector]` 属性。如果你希望某个私有变量在 Inspector 中显示，可以用 `[SerializeField]` 属性。

---

补充内容请参考：
- [[unity引擎基础]] — Transform、Rigidbody、Collider 等组件说明
- [[输入系统]] — Input.GetAxis 与新版输入系统
