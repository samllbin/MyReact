import { beginWork } from './beginWork';
import { completeWork } from './completeWork';
import { fiberNode } from './fiber';

//当前正在工作的fiberNode
let workInprogress: fiberNode | null;

//用于执行初始化的操作
function prepareFreshStack(fiber: fiberNode) {
	workInprogress = fiber;
}
function renderPoot(root: fiberNode) {
	//初始化
	prepareFreshStack(root);

	do {
		try {
			workLoop();
			break;
		} catch (e) {
			console.warn('workLoop发生错误', e);
		}
	} while (true);
}

function workLoop() {
	while (workInprogress !== null) {
		performUnitOfWork(workInprogress);
	}
}

function performUnitOfWork(fiber: fiberNode) {
	const next: fiberNode | null = beginWork(fiber);
	//将pendingProps赋值给memoizeProps
	fiber.memoizedProps = fiber.pendingProps;

	if (next === null) {
		completeUnitOfWork(fiber);
	} else {
		workInprogress = next;
	}
}

function completeUnitOfWork(fiber: fiberNode) {
	let node: fiberNode | null = fiber;

	do {
		completeWork(node);

		const sibling = node.sibling;

		if (sibling !== null) {
			workInprogress = sibling;
			return;
		}
		node = node.return;
		workInprogress = node;
	} while (node !== null);
}
