import {
	createInstance,
	appendInitialChild,
	createTextInstance,
	Container,
	Instance
} from 'hostConfig';
import { FiberNode } from './fiber';
import {
	Fragment,
	FunctionComponent,
	HostComponent,
	HostRoot,
	HostText
} from './workTags';
import { NoFlags, Ref, Update } from './fiberFlags';

function markRef(fiber: FiberNode) {
	fiber.flags |= Ref;
}

//标记更新
function markUpdate(fiber: FiberNode) {
	fiber.flags |= Update;
}

export const completeWork = (wip: FiberNode) => {
	const newProps = wip.pendingProps;
	const current = wip.alternate;

	switch (wip.tag) {
		case HostComponent:
			if (current !== null && wip.stateNode) {
				//update
				// 1.props是否变化{onClick: xx}{onClick: xxx}
				// 2.变了打上flag
				markUpdate(wip);
				if (current.ref !== wip.ref) {
					markRef(wip);
				}
			} else {
				//1.构建DOM
				// const instance = createInstance(wip.type, newProps);
				const instance = createInstance(wip.type, newProps);
				//2.将DOM插到已创建DOM树中
				appendAllChildren(instance, wip);
				wip.stateNode = instance;
				//标记ref
				if (wip.ref !== null) {
					markRef(wip);
				}
			}
			bubbleProperties(wip);
			return null;
		case HostText:
			if (current !== null && wip.stateNode) {
				//update
				const oldText = current.memoizedProps?.content;
				const newText = newProps.content;
				if (oldText !== newText) {
					markUpdate(wip);
				}
			} else {
				//1.构建DOM
				const instance = createTextInstance(newProps.content);
				wip.stateNode = instance;
			}
			bubbleProperties(wip);
			return null;
		case HostRoot:
		case FunctionComponent:
		case Fragment:
			bubbleProperties(wip);
			return null;
		default:
			if (__DEV__) {
				console.warn('未处理的completeWork情况', wip);
			}
			break;
	}
};

function appendAllChildren(parent: Container | Instance, wip: FiberNode) {
	let node = wip.child;

	while (node !== null) {
		if (node?.tag === HostComponent || node?.tag === HostText) {
			appendInitialChild(parent, node.stateNode);
		} else if (node.child !== null) {
			//保持连接
			node.child.return = node;
			node = node.child;
			continue;
		}

		if (node === wip) {
			return;
		}

		while (node.sibling === null) {
			if (node.return === null || node.return === wip) {
				return;
			}
			node = node?.return;
		}
		node.sibling.return = node.return;
		node = node.sibling;
	}
}

//flags冒泡
function bubbleProperties(wip: FiberNode) {
	let subtreeFlags = NoFlags;
	let child = wip.child;

	while (child !== null) {
		subtreeFlags |= child.subtreeFlags;
		subtreeFlags |= child.flags;

		child.return = wip;
		child = child.sibling;
	}
	wip.subtreeFlags = subtreeFlags;
}
