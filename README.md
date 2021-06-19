### 项目说明
face_coding顾名思义面对面共享代码

#### 功能说明

- 1. 实时共享代码编辑器
- 2. 实时文字交流
- 3. 实时音视频交流
  
#### 使用的技术/依赖项
共享编辑器 `codemirror`<br/>
音视频交流 `WebRTC`<br/>
文字交流  `WebRTC dataChannel`<br/>

#### 已经实现的功能

|功能|是否实现|技术|备注|
|:--:|:--:|:--:|:--:|
|音视频通话|✅|WebRTC|基于Janus|
|代码编辑器|✅|codeMirror|-|
|文字聊天|✅|WebRTC|WebRTC dataChannel|
|屏幕共享|❌|WebRTC|-|
|录制功能|❌|WebRTC|-|

#### 后续计划
购买服务器:) 实现房间管控 提升编辑器共享文字的性能  对dataChannel的文字进行加密处理