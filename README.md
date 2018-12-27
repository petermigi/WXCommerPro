## 小程序尺寸单位与设计原则
在iPhone6中，假如设计稿icon图标的尺寸为32*28，那么在小程序中设置的单位则为32rpx*28rpx，而不是32px*28px，这是一种换算规则；假如在其他手机中，那么这种单位换算方式就不是这样了，会复杂很多。<br><br>


## 组件自适应宽度
我们在开发某些小组件的时候，往往要把默认display值为block的组件宽度设置为自适应，因为组件中的内容是动态的，那么该如何做呢？其实很简单，只要设置父元素的css为`display:inline-flex`
```css
.container {
  display: inline-flex;
  flex-direction: row;
  padding: 10rpx;
}
.container image {
  width: 32rpx;
  height: 28rpx;
}
.container text {
  font-size: 24rpx;
  line-height: 24rpx;
  color: #bbb;
  position: relative;
  bottom: 12rpx;
  left: 8rpx;
}
```
假如我们把组件的宽度定死了，那么对组件中内容就必须要进行处理，比如9000可以显示为9k。组件宽度定死的好处就是数据发生变化时页面不会发生闪烁的情况。<br><br>



## 小程序组件开发流程(基础)
目前新版本的小程序有个很强大的功能，就是支持组件化开发，这就意味着开发人员能够节省大量的开发成本，毕竟只要开发一个组件，就能在多个模块中进行调用，那么下面就来介绍开发组件的基础步骤：
- 步骤一：新建一个Component
```
<!--components/like/index.wxml-->
<view bindtap='onLike' class='container'>
  <image src='images/like.png'></image>
  <text>{{count}}</text>
</view>
```
- 步骤二：调用该组件
```
// 在json文件中
{
  "usingComponents": {
    "v-like": "/components/like/index"
  }
}

// 在wxml文件中
<v-like />
```
那么组件的基础使用就是这么简单明了。<br><br>


## 小程序组件开发流程(进阶)
进阶的组件开发就是多了一些JS行为，下面请看定义组件的代码便能略知一二
```html
<!--components/like/index.wxml-->
<view bindtap='onLike' class='container'>
  <image src='{{like?yesSrc:noSrc}}'></image>
  <text>{{count}}</text>
</view>
```

组件样式代码
```css
/* components/like/index.wxss */

.container {
  display: inline-flex;
  flex-direction: row;
  padding: 10rpx;
}

.container image {
  width: 32rpx;
  height: 28rpx;
}

.container text {
  font-size: 24rpx;
  line-height: 24rpx;
  color: #bbb;
  position: relative;
  bottom: 12rpx;
  left: 8rpx;
}
```

组件数据处理代码
```js
// components/like/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    like: {
      type: Boolean,
      value: false
    },
    count: {
      type: Number,
      value: 0
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    yesSrc: 'images/like.png',
    noSrc: 'images/like@dis.png'
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onLike(e) {
      let like = this.properties.like
      let count = this.properties.count

      count = like ? count - 1 : count + 1
      this.setData({
        count: count,
        like: !like
      })
    }
  }
})
```

组件配置文件
```json
{
  "component": true,
  "usingComponents": {}
}
```

以上是定义一个组件的代码，下面是调用者的代码，首先要在json文件中将组件引入进来
```js
{
  "usingComponents": {
    "v-like": "/components/like/index"
  }
}
```

接着在视图层需要传递相关参数
```html
<!--pages/classic/classic.wxml-->
<v-like like="{{classic.like_status}}" count="{{classic.fav_nums}}" />
```

下面是相关的脚本代码，该代码在封装一个HTTP请求里面有详细的介绍，往下看就对了
```js
import {ClassicModel} from '../../models/classic.js'
let classic = new ClassicModel()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    classic: null
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    classic.getLatest(res=>{
      this.setData({
        classic: res
      })
    })
  }
})
```
<br><br>


## 小程序组件开发流程(天秀))
以上的组件都有一个十分致命的问题：在静态效果中，这是没错的，然而在和服务器端进行数据交互的时候，我们该如何判断喜欢的是哪些内容？取消喜欢的又是哪些内容？同时我们又得将该页面的喜欢/不喜欢的值传给服务器进行保存，而不影响其他页面的相同组件。这种业务代码我们该如何书写呢？<br>

为了解决上面的问题，就涉及到了组件粒度的问题，意思就是我们需要将组件公共的业务逻辑和独立的业务逻辑给区分开来，确保组件的通用性，下面我们来看组件代码
```html
<!--components/like/index.wxml-->
<view bindtap='onLike' class='container'>
  <image src='{{like?yesSrc:noSrc}}'></image>
  <text>{{count}}</text>
</view>

// json配置文件
{
  "component": true,
  "usingComponents": {}
}

/* components/like/index.wxss */
.container {
  display: inline-flex;
  flex-direction: row;
  padding: 10rpx;
  width: 90rpx;
}
.container image {
  width: 32rpx;
  height: 28rpx;
}
.container text {
  font-size: 24rpx;
  line-height: 24rpx;
  color: #bbb;
  position: relative;
  bottom: 12rpx;
  left: 8rpx;
}
```

下面是最为核心的组件代码，涉及到了一个新知识——自定义事件：在组件中当触发onLike事件时，那么就会把like这个自定义事件传递出去，并且带上behavior参数
```js
// components/like/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    like: {
      type: Boolean,
      value: false
    },
    count: {
      type: Number,
      value: 0
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    yesSrc: 'images/like.png',
    noSrc: 'images/like@dis.png'
  },
  /**
   * 组件的方法列表
   */
  methods: {
    onLike(e) {
      let like = this.properties.like
      let count = this.properties.count
      count = like ? count - 1 : count + 1
      this.setData({
        count: count,
        like: !like
      })
      // 自定义事件
      let behavior = this.properties.like?'like':'cancel'
      this.triggerEvent('like',{
        behavior: behavior
      },{})
    }
  }
})
```

谈完了组件的代码，下面我们来看看调用组件视图层的代码，首先是结构和json配置代码
```html
<!--pages/classic/classic.wxml-->
<v-like bind:like="onLike" like="{{classic.like_status}}" count="{{classic.fav_nums}}" />

// json配置文件
{
  "usingComponents": {
    "v-like": "/components/like/index"
  }
}
```

下面是调用组件的业务代码，其中核心的与服务器做交互的被拆分出来了，至于如何拆分的请看下面的“封装一个HTTP请求”系列
```js
import { ClassicModel } from '../../models/classic.js'
import { LikeModel } from '../../models/like.js'
let classicModel = new ClassicModel()
let likeModel = new LikeModel()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    classic: null
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    classicModel.getLatest(res=>{
      console.log(res)
      this.setData({
        classic: res
      })
    })
  },
  // 喜欢或者不喜欢
  onLike: function(e) {
    let behavior = e.detail.behavior
    likeModel.like(behavior, this.data.classic.id,this.data.classic.type)
  }
})
```

接着是核心的与服务器做交互代码
```js
import {
  HTTP
} from '../utils/http.js'
class LikeModel extends HTTP {
  like(behavior, artID, category) {
    let url = behavior == 'like' ? 'like' : 'like/cancel'
    this.request({
      url: url,
      method: 'POST',
      data: {
        art_id: artID,
        type: category
      }
    })
  }
}
export {
  LikeModel
}
```
关于封装好的公共http请求处理方法可以往下看“封装一个HTTP请求”系列，参数的传递可以来看[接口文档](https://bl.7yue.pro/dev/index.html)


## const相关知识
只要不改变const变量的内存地址，那么就不会报错


## 封装一个HTTP请求(基础)
### 前言
像我这样的菜鸟在开发项目的时候，往往不懂得如何去封装一些公共方法使开发更加便捷与优雅，导致慢慢的对代码失去些热情，还好及时意识到 **“要想学得更快和更多，首先得学会付出——花钱”**。趁年轻，好好花钱投资自己的头脑，这永远也不亏！

### 开发步骤
首先我们需要创建一个工具库函数，用来存放可能会改变的变量，比如域名以及appkey什么的
```js
// 文件地址和文件名：config.js
const config = {
  api_base_url: 'http://bl.***.pro/v1/',
  appkey: ''
}
export {
  config
}
```

接下来这个是重头戏，使用一个类，封装了公共的HTTP请求方法，并且定义了公共的错误处理函数。在HTTP请求方法中，当访问成功的时候会利用回调函数把数据返回到特定的Page对象中
```js
// 文件名和地址：utils/http.js
import {
  config
} from '../config.js'
// 错误提示
const tips = {
  1: '抱歉，出现了一个未知错误',
  1005: 'appkey无效，请前往www.***.pro申请',
  3000: '期刊不存在'
}

class HTTP {
  // 网络请求函数
  request(params) {
    if (!params.method) {
      params.method = 'GET'
    }
    wx.request({
      url: config.api_base_url + params.url,
      method: params.method,
      data: params.data,
      header: {
        'content-type': 'application/json',
        'appkey': config.appkey
      },
      success: (res) => {
        let code = res.statusCode.toString()
        // 判断状态码是否以2开头
        if (code.startsWith('2')) {
          // 判断调用方是否有回调函数
          params.success && params.success(res.data)
        } else {
          let error_code = res.data.error_code
          this._show_error(error_code)
        }
      },
      fail: (err) => {
        this._show_error(1)
      }
    })
  }

  // 错误处理函数
  _show_error(error_code) {
    if (!error_code) {
      error_code = 1
    }
    wx.showToast({
      title: tips[error_code],
      icon: 'none',
      duration: 2000
    })
  }
}

export {
  HTTP
}
```

最后我们再来调用这个公共的HTTP请求方法
```js
// 文件名和地址：pages/classic/classic.js
import {HTTP} from '../../utils/http.js'
let http = new HTTP()
Page({
  /**
   * 页面的初始数据
   */
  data: {

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    http.request({
      url:'classic/latest',
      success:(res)=>{
        console.log(res)
      }
    })
  }
})
```

通过以上对一个HTTP请求方法的封装，我们在编写代码就能省非常多的力气，并且使代码更加容易维护和高大上。


## 更加优雅的HTTP请求封装
以上对HTTP请求的封装可以说是很优雅了，现在还能把将其变得更优雅，那就是把业务代码拆分出来，下面看代码
```js
// 文件名和地址：models/classic.js
import {
  HTTP
} from '../utils/http.js'

// 类ClassicModel继承了类HTTP，因此自动有request方法
class ClassicModel extends HTTP {
  getLatest(sCallback) {
    this.request({
      url: 'classic/latest',
      success: (res) => {
        sCallback(res)
      }
    })
  }
}

export {
  ClassicModel
}
```
最后在视图层对应的js文件中只要如此调用即可，这种开发方式能够大大的提高工作效率
```js
// 文件名和地址：pages/classic/classic.js
import {ClassicModel} from '../../models/classic.js'
let classic = new ClassicModel()
Page({
  /**
   * 页面的初始数据
   */
  data: {

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    classic.getLatest(res=>{
      console.log(res)
    })
  }
})
```