# **CMAKE_CXX_VISIBILITY_PRESET** 

主要用于控制动态库中符号的可见性，但它也会影响静态库的编译。让我们先了解一些基础知识。

## 符号可见性基础

在 C++ 中，符号可见性决定了哪些符号（如函数和变量）在编译后的二进制文件中是可见的。默认情况下，所有符号都是可见的，但这可能会导致一些问题，如符号冲突和不必要的符号暴露。为了优化和保护代码，可以使用符号可见性设置来控制哪些符号是可见的。

## CMAKE_CXX_VISIBILITY_PRESET 的作用

[CMAKE_CXX_VISIBILITY_PRESET 是 CMake 提供的一个属性，用于设置编译时的符号可见性选项，例如 -fvisibility=](https://cmake.org/cmake/help/latest/prop_tgt/LANG_VISIBILITY_PRESET.html)[1](https://cmake.org/cmake/help/latest/prop_tgt/LANG_VISIBILITY_PRESET.html)[。这个属性会影响所有目标类型的源代码编译，包括静态库和动态库](https://cmake.org/cmake/help/latest/prop_tgt/LANG_VISIBILITY_PRESET.html)[1](https://cmake.org/cmake/help/latest/prop_tgt/LANG_VISIBILITY_PRESET.html)[2](https://discourse.cmake.org/t/did-not-find-fvisibility-hidden-when-using-cmake-cxx-visibility-preset/10526)。

## 静态库中的符号可见性

虽然静态库中的符号默认情况下是可见的，但在某些情况下，编译静态库时也可以使用符号可见性设置来隐藏符号。这在需要控制符号暴露的复杂项目中可能会用到。

## 解决符号找不到的问题

如果你在链接静态库时遇到符号找不到的问题，可能是因为符号被隐藏了。你可以尝试以下方法：

1. 检查静态库的编译选项：确保在编译静态库时没有设置过于严格的可见性选项。

1. 调整可见性设置：在你的 CMakeLists.txt 文件中，设置 CMAKE_CXX_VISIBILITY_PRESET 为 default 或 hidden，并根据需要调整 CMAKE_VISIBILITY_INLINES_HIDDEN。

```cmake
set(CMAKE_CXX_VISIBILITY_PRESET default)
set(CMAKE_VISIBILITY_INLINES_HIDDEN 0)

```

1. 使用导出宏：如果你需要在静态库中导出特定符号，可以使用导出宏来明确指定哪些符号应该是可见的。

# **CMAKE_VISIBILITY_INLINES_HIDDEN** 

是一个 CMake 变量，用于控制是否在编译时隐藏内联函数的符号。具体来说，它决定了是否使用类似 **-fvisibility-inlines-hidden** 的编译器标志[](https://cmake.org/cmake/help/latest/prop_tgt/VISIBILITY_INLINES_HIDDEN.html)。

## 作用

当 CMAKE_VISIBILITY_INLINES_HIDDEN 设置为 ON 时，CMake 会在编译时添加 -fvisibility-inlines-hidden 标志。这意味着所有内联函数的符号将被隐藏，从而减少符号表的大小，并提高加载时间和运行时性能[1](https://cmake.org/cmake/help/latest/prop_tgt/VISIBILITY_INLINES_HIDDEN.html)[2](https://cmake.org/cmake/help/latest/variable/CMAKE_VISIBILITY_INLINES_HIDDEN.html)。

## 使用方法

你可以在 CMakeLists.txt 文件中设置这个变量：

```cmake
set(CMAKE_VISIBILITY_INLINES_HIDDEN ON)

```

这将确保在创建目标时，默认情况下内联函数的符号是隐藏的。

## 影响

- 减少符号表大小：隐藏内联函数的符号可以显著减少生成的二进制文件的符号表大小。

- 提高性能：减少符号表大小可以提高程序的加载时间和运行时性能。

- 符号可见性控制：有助于更好地控制哪些符号在最终生成的二进制文件中是可见的。