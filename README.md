# 小红书工具

## 进展
- [x] 基本界面
- [x] 自动化逻辑实现
- [] 引流/用户试用限制
- [] 产品说明，使用文档

## 运营事项
- [x] cookie获取

  - 首先要分别登录小红书首页 + 创作平台
  - 手动登录打开控制台，查看me接口和info接口上携带的cookie
  - 将cookie填入框后，点击验证，成功后会添加到账号列表中

- [x] cookie存活

  - 在网页登录过后，不能退出，退出cookie就失效了
  - 如果想获取多个账号的情况下，采用无痕模式进行登录
  - 拿到cookie后直接关闭无痕页面即可

## 功能
- [x] 显示自己的笔记列表
  - 监听me接口
  - 拿到userId后切换到我的这一栏
  - 等待页面加载，获取dom

- [x] 支持监听获取某篇笔记下的所有评论（一级评论）
  - 输入笔记ID，跳转笔记页面
  - 监听`sns/web/v2/comment/page?note_id=xxx`接口（如果是未登录，只有部分数据）
  - 等待页面加载，获取DOM
    - 分页情况
    - 子评论情况
  - 最终：暂时支持最多100条一级评论，二级不考虑

- [x] 支持监听笔记评论，设置自动回复
  - 背景：可能会发一些引流笔记，对留言的评论，需要及时回复，比如私信等
  - 支持自定义回复文本
    - 输入笔记ID，仅支持自己的笔记
    - 监听评论成功接口，记录评论id，用户Id
    - 跟数据库对比，找是否该评论id，已回复的数据
    - 定时刷新，自动分页，重复上面逻辑
    - 其他
      - ~~过滤非自己的评论（都行~~
      - ~~可以设置某段时间运行，以释放资源~~
  - 结束监听

- [x] 发布笔记
  - 背景
  - 支持视频发布
  - 支持图文发布
  - 问题
    - 发布笔记两个域名处理的逻辑不一样，token容易有问题

- [x] 提供webui操作界面
  - 自定义顶部操作（logo标题 + 最小化放大关闭区域）
  - 主区域
    - 左边账号管理，已登陆、账号状态、添加新账号
    - 右边，分tab管理
      - 笔记列表
        - 展示笔记的详情，封面，状态（监听状态），自定义回复
        - 操作按钮（取消监听
      - 粉丝列表

- [x] 作品相关UI
  - 历史发布记录
  - 发布新作品

- [x] 增加授权码流程
  - 一个授权码对应使用日期
  - 手动注册、发放
  - 根据授权码进行功能使用

- [] 更新模块
  - 全更新（安装新的包
    - 提供下载地址，包静态地址
    - 提供版本检测接口
    - 提供新版本的win包
    - 提供新版本的mac包
  - 覆盖更新
  - 增量更新

- [x] 话题标签
  - 思路
    - 用户自定义输入标题（不需要带#）
    - 输入文案，等待接口查询返回
    - 匹配接口结果
      - 如果有，找到索引值
        - focus输入框 + mousedonw对应索引的标签
      - 如果没有，自动加个空格进行下个话题标签处理

- [] 自动点赞

- [] 自动评论
