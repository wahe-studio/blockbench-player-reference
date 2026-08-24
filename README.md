# Minecraft Player Reference

独立的 Blockbench 插件，向当前 Bedrock 实体/附着物项目添加 Minecraft 玩家参考模型和动画。

项目地址：<https://github.com/wahe-studio/blockbench-player-reference>

这是一个独立的 Blockbench 插件，不会创建、下载、内嵌或绑定任何贴图。方块会保留标准 64x64 皮肤布局的 UV 坐标，用户可以之后自行添加贴图。

## 使用

### 直接安装

插件 Raw URL：

<https://raw.githubusercontent.com/wahe-studio/blockbench-player-reference/main/dist/minecraft_player_reference.js>

在 Blockbench 中打开“文件 -> 插件”，选择“从 URL 加载插件”，粘贴上面的地址并加载。加载完成后，打开 Bedrock 项目，在“过滤/Filter”菜单中使用“玩家参考”操作。

如果 URL 加载受到浏览器跨域限制，先打开上面的 URL 下载 `minecraft_player_reference.js`，再使用“从文件加载插件”导入。

桌面版也可以直接选择本地 JS 文件加载。

### 从源码构建

```powershell
git clone https://github.com/wahe-studio/blockbench-player-reference.git
cd blockbench-player-reference
npm install
npm run check
npm run build
```

构建产物位于 `dist/minecraft_player_reference.js`。

可用操作：

- 添加第一人称手臂
- 添加第三人称完整玩家
- 同时添加两种模型
- 更新全部模型（先删除旧参考再重建，避免重复）
- 显示/隐藏参考模型
- 删除全部参考模型和动画

## 添加内容

第一人称：右臂 `4 x 12 x 4`、袖子层 `inflate 0.25`、位置 `[4.05, -8.775, 10.5]`、旋转 `[95, -45, 115]`。

当当前项目处于 Bedrock 的 `attachable_first` 第一人称预览模式时，插件使用原生 `rightarm` 骨骼名，让 Blockbench 自动应用原版第一人称姿态，同时保留第一人称参考动画关键帧。普通 Bedrock 实体项目同样保留这些参考动画值。

第三人称：头/帽、身体/外套、双臂/袖子、双腿/裤子；当前参考动画只包含左臂在时间 `0` 的旋转 `[-12.5, 0, 0]`。

所有参考组和方块默认 `export = false`，不会随用户模型导出。操作支持 Blockbench Undo。

## 开发

```powershell
npm install
npm run check
npm run build
```
