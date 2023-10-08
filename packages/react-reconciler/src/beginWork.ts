//递过程

import { fiberNode } from './fiber';

export const beginWork = (workInprogress: fiberNode): fiberNode | null => {
	//与React Element比较，生成fiberNode，然后再返回子fiberNode
	return workInprogress;
};
