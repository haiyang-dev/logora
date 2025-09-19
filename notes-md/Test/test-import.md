# 测试导入功能

这是一个测试导入功能的笔记。

## 代码块测试

```typescript
interface TestInterface {
  name: string;
  age: number;
}

class TestClass implements TestInterface {
  name: string;
  age: number;
  
  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }
  
  greet() {
    return `Hello, I'm ${this.name} and I'm ${this.age} years old.`;
  }
}
```

## 链接测试

[BlockNote官方文档](https://www.blocknotejs.org)

## 列表测试

1. 第一项
2. 第二项
   * 子项1
   * 子项2
3. 第三项

## 表格测试

| 姓名 | 年龄 | 职业 |
| ---- | ---- | ---- |
| 张三 | 25   | 工程师 |
| 李四 | 30   | 设计师 |