# Minecraft Player Reference

独立的 Blockbench 插件，向当前 Bedrock 实体/附着物项目添加 Minecraft 玩家参考模型和动画。

本插件不依赖 `bedrock_attachable`，也不会创建、下载、内嵌或绑定任何贴图。方块会保留标准 64x64 皮肤布局的 UV 坐标，用户可以之后自行添加贴图。

## 使用

1. 运行 `npm install`。
2. 运行 `npm run build`。
3. 在 Blockbench 的“文件 -> 插件”中选择“从文件加载插件”。
4. 选择 `dist/minecraft_player_reference.js`。
5. 打开 Bedrock 项目，在“过滤/Filter”菜单中使用“玩家参考”操作。

可用操作：

- 添加第一人称手臂
- 添加第三人称完整玩家
- 同时添加两种模型
- 更新全部模型（先删除旧参考再重建，避免重复）
- 显示/隐藏参考模型
- 删除全部参考模型和动画

## 添加内容

第一人称：右臂 `4 x 12 x 4`、袖子层 `inflate 0.25`、位置 `[13.5, -10, 12]`、旋转 `[95, -45, 115]`。

第三人称：头/帽、身体/外套、双臂/袖子、双腿/裤子；主手右臂动画旋转 `[-12, 0, 0]`。

所有参考组和方块默认 `export = false`，不会随用户模型导出。操作支持 Blockbench Undo。

## 开发

```powershell
npm install
npm run check
npm run build
```
