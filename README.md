### 项目说明
face_coding顾名思义面对面共享代码

### 启动方式
```shell
## yarn start 可以替换为npm start
# Windows (cmd.exe)
set HTTPS=true&&yarn start

# Windows (Powershell)
($env:HTTPS = "true") -and (yarn start)

# Linux, macOS (Bash)
HTTPS=true yarn start
```


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
|屏幕共享|✅|WebRTC|-|
|声音监控|❌|WebRTC|-|
|录制功能|❌|WebRTC|-|

### 有待优化项
- 1. 退出房间的后续处理
- 2. 声音激励的检测
- 3. 选择设备和切换设备功能
- 4. 聊天共享上下文

#### 后续计划
购买服务器:) 实现房间管控 提升编辑器共享文字的性能  对dataChannel的文字进行加密处理