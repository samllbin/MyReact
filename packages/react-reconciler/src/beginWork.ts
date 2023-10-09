//递过程

import { FiberNodeiberNode } from './fiber';

export const beginWork = (workInprogress: FiberNode): FiberNode | null => {
	//与React Element比较，生成FiberNode，然后再返回子FiberNode
	return workInprogress;
};
