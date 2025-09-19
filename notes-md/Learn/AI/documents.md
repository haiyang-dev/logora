主要是两种， 一个是LLM,一个是Embedding

Embedding一般用来是将非结构化数据处理成向量数据，这个向量装换维度会是问题，要选择一个合适的模型，

Model Format

PyTorch

PyTorch 是一个流行的深度学习框架，支持动态计算图和自动微分。模型通常以 .pt 或 .pth 文件格式保存，使用 Python 的 pickle 序列化工具。PyTorch 模型可以通过 torch.save 保存，通过 torch.load 加载，并使用 model.load_state_dict 恢复模型参数。

### GGUF

GGUF 是一种二进制格式，优化用于快速加载和保存模型，特别适用于推理目的。它由 GGML 开发者 @ggerganov 创建，支持在 Hugging Face Hub 上的模型[](https://huggingface.co/docs/hub/gguf)。GGUF 文件不仅包含张量，还包含标准化的元数据。

### GPTQ

GPTQ 是一种层级量化算法，专注于权重的量化。它通过将每个权重矩阵的浮点参数转换为量化整数来最小化输出误差[6](https://picovoice.ai/blog/what-is-gptq/)。GPTQ 支持混合 int4/fp16 量化方案，权重以 int4 量化，激活保持为 float16。

### AWQ

AWQ（Activation-aware Weight Quantization）是一种激活感知的权重量化方法，专为 LLM 压缩和加速设计。它通过观察激活而不是权重本身来保护重要权重，支持高效的 4-bit 量化[](https://github.com/mit-han-lab/llm-awq)。AWQ 提供了高效的 CUDA 内核实现，适用于快速推理[](https://huggingface.co/TheBloke/law-LLM-AWQ)。

### FP8

FP8 是一种 8-bit 浮点格式，由 NVIDIA、ARM 和 Intel 联合开发，旨在加速深度学习训练和推理。FP8 包含两种编码：E4M3（4-bit 指数和 3-bit 尾数）和 E5M2（5-bit 指数和 2-bit 尾数），适用于量化更多的 LLM 组件[](https://arxiv.org/abs/2209.05433)[](https://www.baseten.co/blog/fp8-efficient-model-inference-with-8-bit-floating-point-numbers/)。

大模型基础

[https://github.com/ZJU-LLMs/Foundations-of-LLMs](https://github.com/ZJU-LLMs/Foundations-of-LLMs)