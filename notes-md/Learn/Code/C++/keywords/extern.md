### 1. **声明变量**

当你在一个文件中定义一个变量，而希望在另一个文件中使用它时，可以使用**extern**关键字来声明该变量。这告诉编译器这个变量在其他地方定义了。

**示例：**

```cpp
// file1.cpp
int i = 10; // 定义变量i

// file2.cpp
extern int i; // 声明变量i

```

在**file2.cpp**中，**extern int i;**告诉编译器变量**i**在其他地方定义了，这样你就可以在**file2.cpp**中使用它。

### 2. **声明函数**

函数的声明和变量类似。你可以在一个文件中定义函数，在另一个文件中声明它。

**示例：**

```cpp
// file1.cpp
void func() {
    // 函数定义
}

// file2.cpp
extern void func(); // 函数声明

```

在**file2.cpp**中，**extern void func();**告诉编译器函数**func**在其他地方定义了。

### 3. **与****const****变量一起使用**

默认情况下，**const**变量具有内部链接（internal linkage），即只能在定义它的文件中使用。如果希望在多个文件中共享**const**变量，可以使用**extern**关键字。

**示例：**

```cpp
// file1.cpp
extern const int bufferSize = 512; // 定义并初始化

// file2.cpp
extern const int bufferSize; // 声明

```

在这种情况下，**bufferSize**在多个文件中共享。

### 4. **extern "C"**

在C++中，如果需要调用C语言的函数，可以使用**extern "C"**来告诉编译器按照C语言的方式进行链接。这对于与C语言库的互操作性非常重要。

**示例：**

```cpp
// file1.c
void cFunction() {
    // C语言函数定义
}

// file2.cpp
extern "C" void cFunction(); // C++中声明C语言函数

```

**extern "C"**告诉编译器不要对函数名进行C++的名称修饰（name mangling），以便C++代码可以调用C语言的函数。

### 5. **多文件项目中的使用**

在大型项目中，通常会有多个源文件和头文件。**extern**关键字可以帮助你在不同文件之间共享变量和函数。例如，你可以在一个头文件中声明变量或函数，然后在多个源文件中包含这个头文件。

**示例：**

```cpp
// common.h
extern int sharedVar; // 声明变量

// file1.cpp
#include "common.h"
int sharedVar = 10; // 定义变量

// file2.cpp
#include "common.h"
void useSharedVar() {
    sharedVar += 5; // 使用变量
}

```

在这个例子中，**sharedVar**在**file1.cpp**中定义，并在**file2.cpp**中使用。

note:

### 头文件中的定义 vs. 声明

**定义**和**声明**是两个不同的概念：

- 定义：分配内存并初始化变量。

- 声明：告诉编译器变量或函数的存在，但不分配内存。

### 为什么不能在头文件中定义变量

如果你在头文件中定义变量，例如：

```cpp
// common.h
int i = 10; // 定义变量

```

然后在多个源文件中包含这个头文件：

```cpp
// file1.cpp
#include "common.h"

// file2.cpp
#include "common.h"

```

这样做会导致每个包含这个头文件的源文件中都有一个独立的变量**i**的定义。这会导致链接错误，因为同一个变量在多个地方被定义了。

### 使用**extern**关键字的原因

为了避免这种情况，我们在头文件中只声明变量，而在一个源文件中定义它：

```cpp
// common.h
extern int i; // 声明变量

// file1.cpp
#include "common.h"
int i = 10; // 定义变量

// file2.cpp
#include "common.h"
void useVariable() {
    i += 5; // 使用变量
}

```

这样，变量**i**只在一个地方定义（**file1.cpp**），而在其他地方只是声明（通过**extern**关键字），确保了变量的唯一性和正确的链接。

### 总结

- 头文件中定义变量：会导致多个定义，产生链接错误。

- 头文件中声明变量：使用**extern**关键字，只声明变量，不分配内存，避免链接错误。