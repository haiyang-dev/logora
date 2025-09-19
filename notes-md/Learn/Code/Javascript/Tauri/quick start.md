install requirements

[https://v2.tauri.app/zh-cn/start/prerequisites/](https://v2.tauri.app/zh-cn/start/prerequisites/)

创建项目

cargo install create-tauri-app --locked

cargo create-tauri-app

如果选择了vue, 那么构建时会使用vite

安装node.js

[https://nodejs.org/en](https://nodejs.org/en)

启动项目

cd tauri-app

npm install -g pnpm

pnpm install

pnpm tauri dev

icon

[https://github.com/primefaces/primeicons](https://github.com/primefaces/primeicons)

UI

[https://ui-libs.vercel.app/](https://ui-libs.vercel.app/)

[https://primevue.org/icons/](https://primevue.org/icons/)

1. Vanilla JS:

	- 简介: 直接使用原生 JavaScript，不依赖任何框架或库。

	- 优点: 轻量级，无需额外的学习成本。

	- 缺点: 需要手动处理所有 DOM 操作和状态管理，代码可能变得复杂。

1. Vue.js:

	- 简介: 一个渐进式 JavaScript 框架，适合构建用户界面。

	- 优点: 易于学习和使用，文档友好，支持组件化开发。

	- 缺点: 社区和资源相对较小，灵活性有时会导致过度复杂。

1. Svelte:

	- 简介: 一个编译器，将组件转换为高效的原生 JavaScript 代码。

	- 优点: 无虚拟 DOM，真正的响应式，性能优越。

	- 缺点: 社区较小，生态系统不如其他框架成熟。

1. React:

	- 简介: 由 Facebook 开发的用于构建用户界面的 JavaScript 库。

	- 优点: 灵活性高，组件化开发，虚拟 DOM 提高性能，大型社区和丰富的生态系统。

	- 缺点: 需要学习 JSX，文档有时不够详细。

1. Solid:

	- 简介: 一个高性能的响应式 UI 库，类似于 React，但没有虚拟 DOM。

	- 优点: 性能优越，真正的响应式编程，组件化开发。

	- 缺点: 社区较小，生态系统不如 React 和 Vue 成熟。

1. Angular:

	- 简介: 由 Google 开发的一个全面的前端框架，使用 TypeScript 构建。

	- 优点: 提供完整的解决方案，包括路由、表单验证和 HTTP 客户端，适合大型企业应用。

	- 缺点: 学习曲线陡峭，框架复杂。

1. Preact:

	- 简介: 一个轻量级的 React 替代品，具有相似的 API。

	- 优点: 体积小，性能高，兼容 React 生态系统。

	- 缺点: 功能较少，社区和资源不如 React 丰富。