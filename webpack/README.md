# Webpack Tips

## Environment variables
在Webpack中， 很多人会将webpack的运行时变量和注入到代码中的变量搞混淆，它们的区别如下：

### Webpack运行时变量

webpack是由NodeJS执行的，所以在执行webpack时，可以用以下方式配置运行时变量:

```sh
CUSTOM_VAR=hello webpack --config webpack.config.js
```

由于操作系统的不同，导致上面的写法无法在windows下工作，在windows中，要用以下方式配置：

```sh
set CUSTOM_VAR=hello webpack --config webpack.config.js
```

为了解决不同操作系统的问题，我们可以引入cross-env，它将根据不同的操作系统来用相应的语法配置运行时变量：

```sh
cross-env CUSTOM_VAR=hello webpack --config webpack.config.js
```

### 全局常量(Global constants)
通过 Webpack 的 `DefinePlugin` 可以创建全局常量注入到代码中, 例如：

```js
new webpack.DefinePlugin({
  VERSION: JSON.stringify('2021-03-07 v1'),
});
```

```js
console.log('Running App version ' + VERSION);
```

在webpack(>=4)中，根据mode参数不同，webpack会自动注入全局常量 `process.env.NODE_ENV`。

```
mode: "development"
process.env.NODE_ENV === ‘development’

mode: "production"
process.env.NODE_ENV === ‘production’
```

默认情况下webpack会将production作为mode的默认值。

在webpack3或者以下，就需要使用插件webpack自带插件DefinePlugin来配置。

```js
plugins: [
 new webpack.DefinePlugin({ 
   'process.env': {
 	    NODE_ENV: JSON.stringify("production")
    }
  })
]
```

__Warning:__
> 当我们定义process的值时，尽量使用 `'process.env.NODE_ENV': JSON.stringify('production')`这种形式，而不要使用`process: { env: { NODE_ENV: JSON.stringify('production') } }`, 因为第二种方式会覆盖process object，进而影响一些依赖process object的第三方模块。

__TIP:__
> DefinePlugin 是对代码中的文本进行直接替换，所以变量的值一定要包含真正的引号。

> Note that because the plugin does a direct text replacement, the value given to it must include actual quotes inside of the string itself. Typically, this is done either with alternate quotes, such as '"production"', or by using JSON.stringify('production').

## TypeScript的支持

### 使用babel进行ts转译
从babel7开始，支持了TypeScript的转译，也就是说我们并不一定非得用之前的方案ts-loader。

https://devblogs.microsoft.com/typescript/typescript-and-babel-7/

大体配置如下

babel.config.js 或 .babelrc
```js
{
  "presets": [
    [
      "@babel/env",
      {
        "corejs": "3",
        "useBuiltIns": "usage"
      }
    ],
    "@babel/typescript",
    [
      "@babel/react",
      {
        "runtime": "automatic"
      }
    ]
  ]
}

```

### 使用ts-loader进行ts转译

```js
module.exports = {
  mode: "development",
  devtool: "inline-source-map",
  entry: "./app.ts",
  output: {
    filename: "bundle.js"
  },
  resolve: {
    // Add `.ts` and `.tsx` as a resolvable extension.
    extensions: [".ts", ".tsx", ".js"]
  },
  module: {
    rules: [
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      { test: /\.tsx?$/, loader: "ts-loader" }
    ]
  }
};
```

### Pros
* ts-loader 只能从源文件输入，无法从其他loader倒入
* 转译速度较 ts-loader 更快
* Babel可以根据目标浏览器情况转换部分语法，更为具体丰富

### Cons
* @babel/plugin-transform-typescript 不做类型检查的（对于ts的类型诊断error, webpack并不会抛出异常）

针对类型检查问题，有一下workaround

在package.json中添加一条命令，来专门进行类型检查

```json
{
    "scripts": {
         "watch": "concurrently -k -p \"[{name}]\" -n \"TypeScript,Node\" -c \"yellow.bold,cyan.bold,green.bold\" \"tsc-w\" \"npm run start\"
     }
}
```

```sh
npm run watch
```



## Webpack4 到 Webpack5 的break change
由于在webpack5中移除了nodejs核心模块的polyfill自动引入，所以需要手动引入，如果打包过程中有使用到nodejs核心模块，webpack会提示进行相应配置，如下以Buffer为例：

```sh
npm install buffer
```

```js
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ["buffer", "Buffer"]
    })
  ]
```






## 常见问题

### error TS2307: Cannot find module './logo.svg' or its corresponding type declarations.

在声明文件中声明各类图片的格式

```ts
declare module '*.svg'
declare module '*.png'
declare module '*.jpg'
declare module '*.jpeg'
declare module '*.gif'
declare module '*.bmp'
declare module '*.tiff'

```

### preset 写法

在很多博客里，关于babel的配置会有以下一种写法，本质上是一样的，不同的alias名称而已。

```js
{
    presets: ["@babel/preset-env", "@babel/preset-react"],
    // presets: ["@babel/env", "@babel/react"]

}
```

### 没有用到React，为什么我需要import引入React?
本质上来说JSX是React.createElement(component, props, ...children)方法的语法糖。

所以我们如果使用了JSX，我们其实就是在使用React，所以我们就需要引入React。

```jsx
import React from 'react';

function App() {
  return <h1>Hello World</h1>;
}
```

```js
import React from 'react';

function App() {
  return React.createElement('h1', null, 'Hello world');
}
```

在React 17中，编译器会自动引入jsx的runtime，所以无需在import React

```js
// 由编译器引入（禁止自己引入！）
import { jsx as _jsx } from 'react/jsx-runtime';

function App() {
  return _jsx('h1', { children: 'Hello world' });
}
```

https://reactjs.bootcss.com/blog/2020/09/22/introducing-the-new-jsx-transform.html


