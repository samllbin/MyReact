export type Flags = number;

export const NoFlags = 0b0000000;
//属性相关
export const Update = 0b0000010;

//结构相关
export const ChildDeletion = 0b0000100;
export const Placement = 0b0000001;

export const PassiveEffect = 0b0001000;

//某个阶段需要执行的操作
export const MutationMask = Placement | Update | ChildDeletion;

//触发effect的回调
export const PassiveMask = PassiveEffect | ChildDeletion;
