//递过程

import { ReactElementType } from 'shared/ReactTypes';
import { FiberNode } from './fiber';
import { UpdateQueue, processUpdateQueue } from './updateQueue';
import {
	ContextProvider,
	Fragment,
	FunctionComponent,
	HostComponent,
	HostRoot,
	HostText
} from './workTags';
import { mountChildFibers, reconcileChildFibers } from './childFibers';
import { renderWithHooks } from './fiberHooks';
import { Lane } from './fiberLanes';
import { Ref } from './fiberFlags';
import { pushProvider } from './fiberContext';

export const beginWork = (wip: FiberNode, renderLane: Lane) => {
	//与React Element比较，生成FiberNode，然后再返回子FiberNode
	switch (wip.tag) {
		case HostRoot:
			return updateHostRoot(wip, renderLane);

		case HostComponent:
			return updateHostComponent(wip);

		case HostText:
			return null;

		case FunctionComponent:
			return updateFunctionComponent(wip, renderLane);
		case Fragment:
			return updateFragment(wip);
		case ContextProvider:
			return updateContextProvider(wip);
		default:
			if (__DEV__) {
				console.warn('workloop未实现的类型', wip);
			}

			break;
	}
	return null;
};

function updateContextProvider(wip: FiberNode) {
	// context.Provider = {
	// 	$$typeof: REACT_PROVIDER_TYPE,
	// 	_context: context
	// };
	const providerType = wip.type;
	const context = providerType._context;
	const newProps = wip.pendingProps;

	pushProvider(context, newProps.value);

	const nextChildren = newProps.children;
	reconcileChildren(wip, nextChildren);
	return wip.child;
}

function updateFragment(wip: FiberNode) {
	const nextChildren = wip.pendingProps;
	reconcileChildren(wip, nextChildren);
	return wip.child;
}

function updateFunctionComponent(wip: FiberNode, renderLane: Lane) {
	const nextChildren = renderWithHooks(wip, renderLane);
	//函数式组件的nextChildren在其函数执行的return中
	reconcileChildren(wip, nextChildren);
	return wip.child;
}

function updateHostRoot(wip: FiberNode, renderLane: Lane) {
	const baseState = wip.memoizedState;
	const updateQueue = wip.updateQueue as UpdateQueue<Element>;
	const pending = updateQueue.shared.pending;
	updateQueue.shared.pending = null;
	//memoizedState为传递进来的React Element,<APP/>组件
	const { memoizedState } = processUpdateQueue(baseState, pending, renderLane);
	wip.memoizedState = memoizedState;

	const nextChildren = wip.memoizedState;
	reconcileChildren(wip, nextChildren);
	return wip.child;
}

function updateHostComponent(wip: FiberNode) {
	//无法触发更新
	const nextProps = wip.pendingProps;
	const nextChildren = nextProps.children;
	markRef(wip.alternate, wip);
	reconcileChildren(wip, nextChildren);
	return wip.child;
}

function reconcileChildren(wip: FiberNode, children?: ReactElementType) {
	const current = wip.alternate;
	if (current !== null) {
		//update
		wip.child = reconcileChildFibers(wip, current?.child, children);
	} else {
		//mount
		wip.child = mountChildFibers(wip, null, children);
	}
}

function markRef(current: FiberNode | null, workInProgressHook: FiberNode) {
	const ref = workInProgressHook.ref;

	if (
		(current === null && ref !== null) ||
		(current !== null && current.ref !== ref)
	) {
		workInProgressHook.flags |= Ref;
	}
}
