export type Vec3 = [number, number, number];

export type CubeSpec = {
  name: string;
  from: Vec3;
  to: Vec3;
  origin: Vec3;
  uv: [number, number];
  inflate?: number;
};

export type BoneSpec = {
  key: string;
  name: string;
  origin: Vec3;
  parent?: string;
  cubes: CubeSpec[];
};

export const FP_POSITION: Vec3 = [4.05, -8.775, 10.5];
export const FP_ROTATION: Vec3 = [95, -45, 115];
export const TP_HOLD_ROTATION: Vec3 = [-12, 0, 0];

export const FIRST_PERSON_BONES: BoneSpec[] = [
  {
    key: 'rightarm',
    // Blockbench's attachable preview applies the vanilla first-person pose
    // to the exact "rightarm" bone name.
    name: 'rightarm',
    origin: [-5, 22, 0],
    cubes: [
      {name: 'right_arm', from: [-8, 12, -2], to: [-4, 24, 2], origin: [-5, 22, 0], uv: [40, 16]},
      {name: 'right_sleeve', from: [-8, 12, -2], to: [-4, 24, 2], origin: [-5, 22, 0], uv: [40, 32], inflate: 0.25},
    ],
  },
];

export const THIRD_PERSON_BONES: BoneSpec[] = [
  {
    key: 'body',
    name: 'player_ref_tp_body',
    origin: [0, 24, 0],
    cubes: [
      {name: 'body', from: [-4, 12, -2], to: [4, 24, 2], origin: [0, 24, 0], uv: [16, 16]},
      {name: 'jacket', from: [-4, 12, -2], to: [4, 24, 2], origin: [0, 24, 0], uv: [16, 32], inflate: 0.25},
    ],
  },
  {
    key: 'head',
    name: 'player_ref_tp_head',
    origin: [0, 24, 0],
    parent: 'body',
    cubes: [
      {name: 'head', from: [-4, 24, -4], to: [4, 32, 4], origin: [0, 24, 0], uv: [0, 0]},
      {name: 'hat', from: [-4, 24, -4], to: [4, 32, 4], origin: [0, 24, 0], uv: [32, 0], inflate: 0.5},
    ],
  },
  {
    key: 'rightarm',
    name: 'player_ref_tp_rightarm',
    origin: [-5, 22, 0],
    parent: 'body',
    cubes: [
      {name: 'right_arm', from: [-8, 12, -2], to: [-4, 24, 2], origin: [-5, 22, 0], uv: [40, 16]},
      {name: 'right_sleeve', from: [-8, 12, -2], to: [-4, 24, 2], origin: [-5, 22, 0], uv: [40, 32], inflate: 0.25},
    ],
  },
  {
    key: 'leftarm',
    name: 'player_ref_tp_leftarm',
    origin: [5, 22, 0],
    parent: 'body',
    cubes: [
      {name: 'left_arm', from: [4, 12, -2], to: [8, 24, 2], origin: [5, 22, 0], uv: [32, 48]},
      {name: 'left_sleeve', from: [4, 12, -2], to: [8, 24, 2], origin: [5, 22, 0], uv: [48, 48], inflate: 0.25},
    ],
  },
  {
    key: 'rightleg',
    name: 'player_ref_tp_rightleg',
    origin: [-1.9, 12, 0],
    parent: 'body',
    cubes: [
      {name: 'right_leg', from: [-3.9, 0, -2], to: [0.1, 12, 2], origin: [-1.9, 12, 0], uv: [0, 16]},
      {name: 'right_pants', from: [-3.9, 0, -2], to: [0.1, 12, 2], origin: [-1.9, 12, 0], uv: [0, 32], inflate: 0.25},
    ],
  },
  {
    key: 'leftleg',
    name: 'player_ref_tp_leftleg',
    origin: [1.9, 12, 0],
    parent: 'body',
    cubes: [
      {name: 'left_leg', from: [-0.1, 0, -2], to: [3.9, 12, 2], origin: [1.9, 12, 0], uv: [16, 48]},
      {name: 'left_pants', from: [-0.1, 0, -2], to: [3.9, 12, 2], origin: [1.9, 12, 0], uv: [0, 48], inflate: 0.25},
    ],
  },
];
