/* Minecraft Player Reference - Apache-2.0 */
(() => {
  // src/data.ts
  var FP_POSITION = [4.05, -8.775, 10.5];
  var FP_ROTATION = [95, -45, 115];
  var FIRST_PERSON_BONES = [
    {
      key: "rightarm",
      // Blockbench's attachable preview applies the vanilla first-person pose
      // to the exact "rightarm" bone name.
      name: "rightarm",
      origin: [-5, 22, 0],
      cubes: [
        { name: "right_arm", from: [-8, 12, -2], to: [-4, 24, 2], origin: [-5, 22, 0], uv: [40, 16] },
        { name: "right_sleeve", from: [-8, 12, -2], to: [-4, 24, 2], origin: [-5, 22, 0], uv: [40, 32], inflate: 0.25 }
      ]
    }
  ];
  var THIRD_PERSON_BONES = [
    {
      key: "body",
      name: "player_ref_tp_body",
      origin: [0, 24, 0],
      cubes: [
        { name: "body", from: [-4, 12, -2], to: [4, 24, 2], origin: [0, 24, 0], uv: [16, 16] },
        { name: "jacket", from: [-4, 12, -2], to: [4, 24, 2], origin: [0, 24, 0], uv: [16, 32], inflate: 0.25 }
      ]
    },
    {
      key: "head",
      name: "player_ref_tp_head",
      origin: [0, 24, 0],
      parent: "body",
      cubes: [
        { name: "head", from: [-4, 24, -4], to: [4, 32, 4], origin: [0, 24, 0], uv: [0, 0] },
        { name: "hat", from: [-4, 24, -4], to: [4, 32, 4], origin: [0, 24, 0], uv: [32, 0], inflate: 0.5 }
      ]
    },
    {
      key: "rightarm",
      name: "player_ref_tp_rightarm",
      origin: [-5, 22, 0],
      parent: "body",
      cubes: [
        { name: "right_arm", from: [-8, 12, -2], to: [-4, 24, 2], origin: [-5, 22, 0], uv: [40, 16] },
        { name: "right_sleeve", from: [-8, 12, -2], to: [-4, 24, 2], origin: [-5, 22, 0], uv: [40, 32], inflate: 0.25 }
      ]
    },
    {
      key: "leftarm",
      name: "player_ref_tp_leftarm",
      origin: [5, 22, 0],
      parent: "body",
      cubes: [
        { name: "left_arm", from: [4, 12, -2], to: [8, 24, 2], origin: [5, 22, 0], uv: [32, 48] },
        { name: "left_sleeve", from: [4, 12, -2], to: [8, 24, 2], origin: [5, 22, 0], uv: [48, 48], inflate: 0.25 }
      ]
    },
    {
      key: "rightleg",
      name: "player_ref_tp_rightleg",
      origin: [-1.9, 12, 0],
      parent: "body",
      cubes: [
        { name: "right_leg", from: [-3.9, 0, -2], to: [0.1, 12, 2], origin: [-1.9, 12, 0], uv: [0, 16] },
        { name: "right_pants", from: [-3.9, 0, -2], to: [0.1, 12, 2], origin: [-1.9, 12, 0], uv: [0, 32], inflate: 0.25 }
      ]
    },
    {
      key: "leftleg",
      name: "player_ref_tp_leftleg",
      origin: [1.9, 12, 0],
      parent: "body",
      cubes: [
        { name: "left_leg", from: [-0.1, 0, -2], to: [3.9, 12, 2], origin: [1.9, 12, 0], uv: [16, 48] },
        { name: "left_pants", from: [-0.1, 0, -2], to: [3.9, 12, 2], origin: [1.9, 12, 0], uv: [0, 48], inflate: 0.25 }
      ]
    }
  ];

  // src/index.ts
  var PLUGIN_ID = "minecraft_player_reference";
  var ROOT_NAMES = {
    fp: "player_ref_fp",
    tp: "player_ref_tp"
  };
  var ANIMATION_NAMES = {
    fp: "animation.player_reference.first_person",
    tp: "animation.player_reference.third_person_main_hand"
  };
  var actions = [];
  function isBedrockProject() {
    if (typeof Format === "undefined" || !Format) return false;
    const id = String(Format.id || "").toLowerCase();
    return Boolean(Format.bone_rig || Format.animation_mode || id.includes("bedrock"));
  }
  function requireBedrockProject() {
    if (!Project || !isBedrockProject()) {
      Blockbench.showQuickMessage("\u8BF7\u5148\u6253\u5F00\u4E00\u4E2A Bedrock \u5B9E\u4F53\u6216\u9644\u7740\u7269\u6A21\u578B\u9879\u76EE", 2500);
      return false;
    }
    return true;
  }
  function beginUndo() {
    if (Undo && Undo.initEdit) {
      const animations = typeof Animation !== "undefined" && Animation.all ? Animation.all.slice() : [];
      Undo.initEdit({ outliner: true, elements: [], animations });
    }
  }
  function finishUndo(label) {
    if (Undo && Undo.finishEdit) Undo.finishEdit(label);
  }
  function markReference(node) {
    node.export = false;
    node.visibility = true;
    node.player_reference_plugin = PLUGIN_ID;
    return node;
  }
  function createRoot(kind) {
    const root = new Group({
      name: ROOT_NAMES[kind],
      origin: [0, 24, 0],
      isOpen: true,
      export: false
    }).init();
    return markReference(root);
  }
  function createBone(spec, root, bones) {
    const parent = spec.parent ? bones.get(spec.parent) || root : root;
    const group = markReference(new Group({
      name: spec.name,
      origin: spec.origin,
      isOpen: true,
      export: false
    }).addTo(parent).init());
    for (const cubeSpec of spec.cubes) createCube(cubeSpec, group);
    bones.set(spec.key, group);
    return group;
  }
  function createCube(spec, parent) {
    const options = {
      name: spec.name,
      from: spec.from,
      to: spec.to,
      origin: spec.origin,
      uv_offset: spec.uv,
      autouv: 0,
      export: false
    };
    if (spec.inflate !== void 0) options.inflate = spec.inflate;
    return markReference(new Cube(options).addTo(parent).init());
  }
  function findRoot(kind) {
    if (typeof Group === "undefined" || !Group.all) return null;
    return Group.all.find((group) => group.name === ROOT_NAMES[kind]) || null;
  }
  function findAnimation(kind) {
    if (typeof Animation === "undefined" || !Animation.all) return null;
    return Animation.all.find((animation) => animation.name === ANIMATION_NAMES[kind]) || null;
  }
  function removeNode(node) {
    if (node && typeof node.remove === "function") node.remove();
  }
  function removeKind(kind) {
    const root = findRoot(kind);
    const animation = findAnimation(kind);
    if (root) removeNode(root);
    if (animation) removeNode(animation);
    return Boolean(root || animation);
  }
  function addKeyframe(animator, channel, data, time = 0) {
    animator.addKeyframe({
      channel,
      time,
      interpolation: "linear",
      data_points: [{ x: String(data[0]), y: String(data[1]), z: String(data[2]) }]
    });
  }
  function createAnimation(kind, bone, leftArm) {
    const animation = new Animation({
      name: ANIMATION_NAMES[kind],
      loop: "hold",
      length: 0.05,
      override: false
    }).add();
    const animator = animation.getBoneAnimator(bone);
    if (!animator) throw new Error(`\u65E0\u6CD5\u4E3A ${bone.name} \u521B\u5EFA\u52A8\u753B\u8F68\u9053`);
    if (kind === "fp") {
      addKeyframe(animator, "position", FP_POSITION);
      addKeyframe(animator, "rotation", FP_ROTATION);
    } else {
      if (leftArm) {
        const leftAnimator = animation.getBoneAnimator(leftArm);
        if (!leftAnimator) throw new Error(`\u65E0\u6CD5\u4E3A ${leftArm.name} \u521B\u5EFA\u52A8\u753B\u8F68\u9053`);
        addKeyframe(leftAnimator, "rotation", [-12.5, 0, 0], 0);
      }
    }
    return animation;
  }
  function addKind(kind, replace = true) {
    var _a;
    if (!requireBedrockProject()) return;
    beginUndo();
    try {
      if (replace) removeKind(kind);
      const root = createRoot(kind);
      const specs = kind === "fp" ? FIRST_PERSON_BONES : THIRD_PERSON_BONES;
      const bones = /* @__PURE__ */ new Map();
      for (const spec of specs) createBone(spec, root, bones);
      const animationBone = bones.get("rightarm");
      if (!animationBone) throw new Error("\u627E\u4E0D\u5230\u53F3\u81C2\u9AA8\u9ABC");
      createAnimation(kind, animationBone, kind === "tp" ? bones.get("leftarm") : void 0);
      (_a = root.select) == null ? void 0 : _a.call(root);
      finishUndo(kind === "fp" ? "\u6DFB\u52A0\u7B2C\u4E00\u4EBA\u79F0\u73A9\u5BB6\u624B\u81C2" : "\u6DFB\u52A0\u7B2C\u4E09\u4EBA\u79F0\u73A9\u5BB6\u6A21\u578B");
      Blockbench.showQuickMessage(kind === "fp" ? "\u5DF2\u6DFB\u52A0\u7B2C\u4E00\u4EBA\u79F0\u73A9\u5BB6\u624B\u81C2" : "\u5DF2\u6DFB\u52A0\u7B2C\u4E09\u4EBA\u79F0\u73A9\u5BB6\u6A21\u578B", 1800);
    } catch (error) {
      console.error(`[${PLUGIN_ID}]`, error);
      if (Undo && Undo.cancelEdit) Undo.cancelEdit();
      Blockbench.showMessageBox({ title: "\u73A9\u5BB6\u53C2\u8003\u6A21\u578B\u6DFB\u52A0\u5931\u8D25", message: String((error == null ? void 0 : error.message) || error) });
    }
  }
  function addBoth() {
    if (!requireBedrockProject()) return;
    beginUndo();
    try {
      removeKind("fp");
      removeKind("tp");
      for (const kind of ["fp", "tp"]) {
        const root = createRoot(kind);
        const specs = kind === "fp" ? FIRST_PERSON_BONES : THIRD_PERSON_BONES;
        const bones = /* @__PURE__ */ new Map();
        for (const spec of specs) createBone(spec, root, bones);
        createAnimation(kind, bones.get("rightarm"), kind === "tp" ? bones.get("leftarm") : void 0);
      }
      finishUndo("\u6DFB\u52A0\u7B2C\u4E00/\u7B2C\u4E09\u4EBA\u79F0\u73A9\u5BB6\u53C2\u8003");
      Blockbench.showQuickMessage("\u5DF2\u6DFB\u52A0\u7B2C\u4E00\u548C\u7B2C\u4E09\u4EBA\u79F0\u73A9\u5BB6\u53C2\u8003", 1800);
    } catch (error) {
      console.error(`[${PLUGIN_ID}]`, error);
      if (Undo && Undo.cancelEdit) Undo.cancelEdit();
      Blockbench.showMessageBox({ title: "\u73A9\u5BB6\u53C2\u8003\u6A21\u578B\u6DFB\u52A0\u5931\u8D25", message: String((error == null ? void 0 : error.message) || error) });
    }
  }
  function updateAll() {
    addBoth();
  }
  function removeAll() {
    if (!requireBedrockProject()) return;
    beginUndo();
    const removedFp = removeKind("fp");
    const removedTp = removeKind("tp");
    const removed = removedFp || removedTp;
    if (removed || removedTp) {
      finishUndo("\u5220\u9664\u73A9\u5BB6\u53C2\u8003\u6A21\u578B");
      Blockbench.showQuickMessage("\u5DF2\u5220\u9664\u73A9\u5BB6\u53C2\u8003\u6A21\u578B", 1800);
    } else {
      if (Undo && Undo.cancelEdit) Undo.cancelEdit();
      Blockbench.showQuickMessage("\u5F53\u524D\u9879\u76EE\u6CA1\u6709\u73A9\u5BB6\u53C2\u8003\u6A21\u578B", 1800);
    }
  }
  function toggleVisibility() {
    if (!requireBedrockProject()) return;
    const roots = [findRoot("fp"), findRoot("tp")].filter(Boolean);
    if (!roots.length) {
      Blockbench.showQuickMessage("\u5F53\u524D\u9879\u76EE\u6CA1\u6709\u73A9\u5BB6\u53C2\u8003\u6A21\u578B", 1800);
      return;
    }
    const visible = roots.some((root) => root.visibility !== false);
    beginUndo();
    for (const root of roots) root.visibility = !visible;
    finishUndo(visible ? "\u9690\u85CF\u73A9\u5BB6\u53C2\u8003\u6A21\u578B" : "\u663E\u793A\u73A9\u5BB6\u53C2\u8003\u6A21\u578B");
  }
  function createAction(id, name, icon, click) {
    const action = new Action(id, { name, icon, click });
    actions.push(action);
    MenuBar.addAction(action, "filter");
    return action;
  }
  Plugin.register(PLUGIN_ID, {
    title: "Minecraft \u73A9\u5BB6\u53C2\u8003\u6A21\u578B",
    author: "Local project",
    description: "\u5411\u5F53\u524D Bedrock \u9879\u76EE\u6DFB\u52A0 Minecraft \u73A9\u5BB6\u7B2C\u4E00\u4EBA\u79F0\u624B\u81C2\u3001\u7B2C\u4E09\u4EBA\u79F0\u6A21\u578B\u548C\u52A8\u753B\uFF0C\u4E0D\u6DFB\u52A0\u8D34\u56FE\u3002",
    icon: "person_add",
    version: "0.1.0",
    min_version: "4.12.0",
    variant: "both",
    tags: ["Minecraft: Bedrock Edition", "Animation", "Reference Model"],
    onload() {
      createAction("player_reference_add_fp", "\u73A9\u5BB6\u53C2\u8003\uFF1A\u6DFB\u52A0\u7B2C\u4E00\u4EBA\u79F0\u624B\u81C2", "front_hand", () => addKind("fp"));
      createAction("player_reference_add_tp", "\u73A9\u5BB6\u53C2\u8003\uFF1A\u6DFB\u52A0\u7B2C\u4E09\u4EBA\u79F0\u73A9\u5BB6", "person", () => addKind("tp"));
      createAction("player_reference_add_both", "\u73A9\u5BB6\u53C2\u8003\uFF1A\u6DFB\u52A0\u7B2C\u4E00\u548C\u7B2C\u4E09\u4EBA\u79F0", "person_add", addBoth);
      createAction("player_reference_update", "\u73A9\u5BB6\u53C2\u8003\uFF1A\u66F4\u65B0\u5168\u90E8\u6A21\u578B", "sync", updateAll);
      createAction("player_reference_toggle", "\u73A9\u5BB6\u53C2\u8003\uFF1A\u663E\u793A/\u9690\u85CF", "visibility", toggleVisibility);
      createAction("player_reference_remove", "\u73A9\u5BB6\u53C2\u8003\uFF1A\u5220\u9664\u5168\u90E8\u6A21\u578B", "delete", removeAll);
    },
    onunload() {
      for (const action of actions) action.delete();
      actions = [];
    }
  });
})();
