你可以只用FastAPI，但通常会与Uvicorn一起使用，原因如下：

1. FastAPI：主要用于定义API的路由、处理请求和响应、数据验证等。它是一个Web框架，帮助你构建API的逻辑部分。

1. Uvicorn：是一个ASGI服务器，用于运行FastAPI应用。它负责处理客户端的请求，将请求传递给FastAPI应用，并将响应返回给客户端。

**为什么要一起用**：

- 性能：Uvicorn是一个高性能的ASGI服务器，能够处理大量并发请求，确保你的FastAPI应用在高负载下仍能高效运行。

- 异步支持：Uvicorn支持异步编程模型，这与FastAPI的设计理念一致，能够充分利用异步特性，提高应用的响应速度和性能。

- 部署：在生产环境中，使用Uvicorn可以更好地管理和部署FastAPI应用，提供稳定和高效的运行环境。

简单来说，FastAPI负责应用逻辑，而Uvicorn负责运行和管理应用，两者结合使用可以充分发挥各自的优势。如果你只是进行本地开发和测试，FastAPI自带的开发服务器可能已经足够，但在生产环境中，使用Uvicorn会更合适。

不完全是这样。虽然FastAPI和Uvicorn组合起来可以实现类似Flask的功能，但它们在设计理念和技术实现上有一些重要的区别：

1. 设计理念：

	- FastAPI：专注于高性能和异步编程，使用Python类型提示进行数据验证和序列化，自动生成API文档。

	- Flask：轻量级和灵活，适合快速开发和原型设计，依赖扩展来增加功能。

1. 技术实现：

	- FastAPI + Uvicorn：FastAPI处理应用逻辑，Uvicorn作为ASGI服务器处理并发请求和异步操作。这种组合非常适合需要高并发和异步处理的应用。

	- Flask：通常使用WSGI服务器（如Gunicorn）来运行，主要处理同步请求，适合简单到中等复杂度的Web应用。

1. 性能：

	- FastAPI + Uvicorn：由于支持异步编程，性能通常优于Flask，特别是在处理大量并发请求时。

	- Flask：性能较好，但在高并发场景下可能不如FastAPI + Uvicorn组合。

总结来说，FastAPI + Uvicorn提供了更高的性能和异步支持，而Flask则以其简单和灵活性著称。选择哪个框架取决于你的具体需求和项目特点。如果你需要高性能和异步处理，FastAPI + Uvicorn是一个很好的选择；如果你需要快速开发和灵活性，Flask可能更适合。

ASGI（Asynchronous Server Gateway Interface）和WSGI（Web Server Gateway Interface）是Python Web应用程序与Web服务器之间的接口标准，但它们在设计和用途上有一些关键区别：

1. 同步 vs 异步：

	- WSGI：是同步的，每个请求必须等待前一个请求完成。这意味着在处理大量并发请求时，性能可能会受到限制

	- ASGI：是异步的，可以同时处理多个请求，适合高并发和实时通信应用，如WebSocket和HTTP/2

1. 扩展性：

	- WSGI：主要用于HTTP协议，不支持WebSocket等其他协议

	- ASGI：支持多种协议，包括HTTP、HTTP/2和WebSocket，适用于需要实时通信的现代Web应用

1. 性能：

	- WSGI：在处理同步请求时性能良好，但在高并发场景下可能成为瓶颈

	- ASGI：由于其异步特性，在高并发场景下性能更好，可以并行处理大量请求

1. 复杂度：

	- WSGI：相对简单，适合处理传统的Web应用，代码编写和调试较为容易

	- ASGI：由于异步特性，代码编写和调试会更加复杂，但能提供更高的性能和扩展性

总结来说，WSGI适用于传统的、以HTTP为主的Web应用，而ASGI则适用于需要高并发、实时通信或WebSocket的现代Web应用。选择哪种接口标准取决于你的具体需求和应用场景。

[](https://blog.csdn.net/p515659704/article/details/110411508)