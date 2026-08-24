import {FIRST_PERSON_BONES, THIRD_PERSON_BONES, FP_POSITION, FP_ROTATION, TP_HOLD_ROTATION, BoneSpec, CubeSpec, Vec3} from './data';

declare const Plugin: any;
declare const Action: any;
declare const MenuBar: any;
declare const Dialog: any;
declare const Undo: any;
declare const Group: any;
declare const Cube: any;
declare const Animation: any;
declare const Format: any;
declare const Project: any;
declare const Blockbench: any;

const PLUGIN_ID = 'minecraft_player_reference';
const ROOT_NAMES = {
  fp: 'player_ref_fp',
  tp: 'player_ref_tp',
} as const;
const ANIMATION_NAMES = {
  fp: 'animation.player_reference.first_person',
  tp: 'animation.player_reference.third_person_main_hand',
} as const;

type Kind = keyof typeof ROOT_NAMES;

let actions: any[] = [];

function isBedrockProject(): boolean {
  if (typeof Format === 'undefined' || !Format) return false;
  const id = String(Format.id || '').toLowerCase();
  return Boolean(Format.bone_rig || Format.animation_mode || id.includes('bedrock'));
}

function requireBedrockProject(): boolean {
  if (!Project || !isBedrockProject()) {
    Blockbench.showQuickMessage('请先打开一个 Bedrock 实体或附着物模型项目', 2500);
    return false;
  }
  return true;
}

function beginUndo(): void {
  if (Undo && Undo.initEdit) {
    const animations = typeof Animation !== 'undefined' && Animation.all ? Animation.all.slice() : [];
    Undo.initEdit({outliner: true, elements: [], animations});
  }
}

function finishUndo(label: string): void {
  if (Undo && Undo.finishEdit) Undo.finishEdit(label);
}

function markReference(node: any): any {
  node.export = false;
  node.visibility = true;
  node.player_reference_plugin = PLUGIN_ID;
  return node;
}

function createRoot(kind: Kind): any {
  const root = new Group({
    name: ROOT_NAMES[kind],
    origin: [0, 24, 0],
    isOpen: true,
    export: false,
  }).init();
  return markReference(root);
}

function createBone(spec: BoneSpec, root: any, bones: Map<string, any>): any {
  const parent = spec.parent ? bones.get(spec.parent) || root : root;
  const group = markReference(new Group({
    name: spec.name,
    origin: spec.origin,
    isOpen: true,
    export: false,
  }).addTo(parent).init());

  for (const cubeSpec of spec.cubes) createCube(cubeSpec, group);
  bones.set(spec.key, group);
  return group;
}

function createCube(spec: CubeSpec, parent: any): any {
  const options: any = {
    name: spec.name,
    from: spec.from,
    to: spec.to,
    origin: spec.origin,
    uv_offset: spec.uv,
    autouv: 0,
    export: false,
  };
  if (spec.inflate !== undefined) options.inflate = spec.inflate;
  return markReference(new Cube(options).addTo(parent).init());
}

function findRoot(kind: Kind): any {
  if (typeof Group === 'undefined' || !Group.all) return null;
  return Group.all.find((group: any) => group.name === ROOT_NAMES[kind]) || null;
}

function findAnimation(kind: Kind): any {
  if (typeof Animation === 'undefined' || !Animation.all) return null;
  return Animation.all.find((animation: any) => animation.name === ANIMATION_NAMES[kind]) || null;
}

function removeNode(node: any): void {
  if (node && typeof node.remove === 'function') node.remove();
}

function removeKind(kind: Kind): boolean {
  const root = findRoot(kind);
  const animation = findAnimation(kind);
  if (root) removeNode(root);
  if (animation) removeNode(animation);
  return Boolean(root || animation);
}

function addKeyframe(animator: any, channel: string, data: Vec3, time = 0): void {
  animator.addKeyframe({
    channel,
    time,
    interpolation: 'linear',
    data_points: [{x: String(data[0]), y: String(data[1]), z: String(data[2])}],
  });
}

function createAnimation(kind: Kind, bone: any, leftArm?: any): any {
  const animation = new Animation({
    name: ANIMATION_NAMES[kind],
    loop: 'hold',
    length: 0.05,
    override: false,
  }).add();
  const animator = animation.getBoneAnimator(bone);
  if (!animator) throw new Error(`无法为 ${bone.name} 创建动画轨道`);
  if (kind === 'fp') {
    addKeyframe(animator, 'position', FP_POSITION);
    addKeyframe(animator, 'rotation', FP_ROTATION);
  } else {
    if (leftArm) {
      const leftAnimator = animation.getBoneAnimator(leftArm);
      if (!leftAnimator) throw new Error(`无法为 ${leftArm.name} 创建动画轨道`);
      addKeyframe(leftAnimator, 'rotation', [-12.5, 0, 0], 0);
    }
  }
  return animation;
}

function addKind(kind: Kind, replace = true): void {
  if (!requireBedrockProject()) return;
  beginUndo();
  try {
    if (replace) removeKind(kind);
    const root = createRoot(kind);
    const specs = kind === 'fp' ? FIRST_PERSON_BONES : THIRD_PERSON_BONES;
    const bones = new Map<string, any>();
    for (const spec of specs) createBone(spec, root, bones);
    const animationBone = bones.get('rightarm');
    if (!animationBone) throw new Error('找不到右臂骨骼');
    createAnimation(kind, animationBone, kind === 'tp' ? bones.get('leftarm') : undefined);
    root.select?.();
    finishUndo(kind === 'fp' ? '添加第一人称玩家手臂' : '添加第三人称玩家模型');
    Blockbench.showQuickMessage(kind === 'fp' ? '已添加第一人称玩家手臂' : '已添加第三人称玩家模型', 1800);
  } catch (error: any) {
    console.error(`[${PLUGIN_ID}]`, error);
    if (Undo && Undo.cancelEdit) Undo.cancelEdit();
    Blockbench.showMessageBox({title: '玩家参考模型添加失败', message: String(error?.message || error)});
  }
}

function addBoth(): void {
  if (!requireBedrockProject()) return;
  beginUndo();
  try {
    removeKind('fp');
    removeKind('tp');
    for (const kind of ['fp', 'tp'] as Kind[]) {
      const root = createRoot(kind);
      const specs = kind === 'fp' ? FIRST_PERSON_BONES : THIRD_PERSON_BONES;
      const bones = new Map<string, any>();
      for (const spec of specs) createBone(spec, root, bones);
      createAnimation(kind, bones.get('rightarm'), kind === 'tp' ? bones.get('leftarm') : undefined);
    }
    finishUndo('添加第一/第三人称玩家参考');
    Blockbench.showQuickMessage('已添加第一和第三人称玩家参考', 1800);
  } catch (error: any) {
    console.error(`[${PLUGIN_ID}]`, error);
    if (Undo && Undo.cancelEdit) Undo.cancelEdit();
    Blockbench.showMessageBox({title: '玩家参考模型添加失败', message: String(error?.message || error)});
  }
}

function updateAll(): void {
  addBoth();
}

function removeAll(): void {
  if (!requireBedrockProject()) return;
  beginUndo();
  const removedFp = removeKind('fp');
  const removedTp = removeKind('tp');
  const removed = removedFp || removedTp;
  if (removed || removedTp) {
    finishUndo('删除玩家参考模型');
    Blockbench.showQuickMessage('已删除玩家参考模型', 1800);
  } else {
    if (Undo && Undo.cancelEdit) Undo.cancelEdit();
    Blockbench.showQuickMessage('当前项目没有玩家参考模型', 1800);
  }
}

function toggleVisibility(): void {
  if (!requireBedrockProject()) return;
  const roots = [findRoot('fp'), findRoot('tp')].filter(Boolean);
  if (!roots.length) {
    Blockbench.showQuickMessage('当前项目没有玩家参考模型', 1800);
    return;
  }
  const visible = roots.some((root: any) => root.visibility !== false);
  beginUndo();
  for (const root of roots) root.visibility = !visible;
  finishUndo(visible ? '隐藏玩家参考模型' : '显示玩家参考模型');
}

function createAction(id: string, name: string, icon: string, click: () => void): any {
  const action = new Action(id, {name, icon, click});
  actions.push(action);
  MenuBar.addAction(action, 'filter');
  return action;
}

Plugin.register(PLUGIN_ID, {
  title: 'Minecraft 玩家参考模型',
  author: 'Local project',
  description: '向当前 Bedrock 项目添加 Minecraft 玩家第一人称手臂、第三人称模型和动画，不添加贴图。',
  icon: 'person_add',
  version: '0.1.0',
  min_version: '4.12.0',
  variant: 'both',
  tags: ['Minecraft: Bedrock Edition', 'Animation', 'Reference Model'],
  onload() {
    createAction('player_reference_add_fp', '玩家参考：添加第一人称手臂', 'front_hand', () => addKind('fp'));
    createAction('player_reference_add_tp', '玩家参考：添加第三人称玩家', 'person', () => addKind('tp'));
    createAction('player_reference_add_both', '玩家参考：添加第一和第三人称', 'person_add', addBoth);
    createAction('player_reference_update', '玩家参考：更新全部模型', 'sync', updateAll);
    createAction('player_reference_toggle', '玩家参考：显示/隐藏', 'visibility', toggleVisibility);
    createAction('player_reference_remove', '玩家参考：删除全部模型', 'delete', removeAll);
  },
  onunload() {
    for (const action of actions) action.delete();
    actions = [];
  },
});
