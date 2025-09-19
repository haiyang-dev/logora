### **std::make_shared**

**std::make_shared** 是 C++11 引入的一个函数模板，用于创建并初始化一个对象，并返回一个指向该对象的 **std::shared_ptr**。它的优点包括：

1. 简洁性：简化了创建 **shared_ptr** 的语法。

1. 效率：在单一的内存分配中同时分配对象和控制块，减少了内存分配的次数，提高了效率。

### 使用示例

```cpp
auto ptr = std::make_shared<MyClass>(constructor_arg1, constructor_arg2);

```

这行代码创建了一个 **MyClass** 对象，并用 **constructor_arg1** 和 **constructor_arg2** 初始化它，然后返回一个指向该对象的 **std::shared_ptr**。

### 具体代码解释

```cpp
auto logger = std::make_shared<spdlog::logger>("logger", sink_list.begin(), sink_list.end());

```

这行代码的具体含义如下：

1. auto：自动类型推导，编译器会根据右侧的表达式推导出变量 **logger** 的类型。在这里，**logger** 的类型是 **std::shared_ptr<spdlog::logger>**。

1. std::make_shared<spdlog::logger>：创建一个 **spdlog::logger** 对象，并返回一个指向该对象的 **std::shared_ptr**。

1. "logger"：传递给 **spdlog::logger** 构造函数的第一个参数，表示日志器的名称。

1. sink_list.begin(), sink_list.end()：传递给 **spdlog::logger** 构造函数的其他参数，表示接收器列表的开始和结束迭代器。

### 整体流程

- 创建对象：**std::make_shared<spdlog::logger>** 创建一个 **spdlog::logger** 对象。

- 初始化对象：使用 **"logger"** 和 **sink_list** 的开始和结束迭代器初始化 **spdlog::logger** 对象。

- 返回指针：返回一个指向该对象的 **std::shared_ptr**，并将其赋值给 **logger** 变量。

### 总结

这行代码通过 **std::make_shared** 创建并初始化了一个 **spdlog::logger** 对象，并返回一个指向该对象的 **std::shared_ptr**。这样做不仅简化了代码，还提高了内存分配的效率。