import { Dispatch } from 'react/src/currentDispather';
import { Action } from 'shared/ReactTypes';
import { Lane } from './fiberLanes';

export interface Update<State> {
	action: Action<State>;
	lane: Lane;
	next: Update<any> | null;
}
//为什么在Update中还有一个shared对象，并且放在pending下，便于wip和current共用一个updateQueue
export interface UpdateQueue<State> {
	shared: {
		pending: Update<State> | null;
	};
	//为hook保存dispatch
	dispatch: Dispatch<State> | null;
}

export const createUpdate = <State>(
	action: Action<State>,
	lane: Lane
): Update<State> => {
	return {
		action,
		lane,
		next: null
	};
};

export const createUpdateQueue = <State>() => {
	return {
		shared: {
			pending: null
		},
		dispatch: null
	} as UpdateQueue<State>;
};

export const enqueueUpdate = <State>(
	updateQueue: UpdateQueue<State>,
	update: Update<State>
) => {
	const pending = updateQueue.shared.pending;
	if (pending === null) {
		//自己形成环状链表
		update.next = update;
	} else {
		//pending指向最后插入的update
		//.next为第一个update
		update.next = pending.next;
		pending.next = update;
	}
	updateQueue.shared.pending = update;
};

export const processUpdateQueue = <State>(
	baseState: State,
	pendingUpdate: Update<State> | null,
	renderLane: Lane
): { memoizedState: State } => {
	const result: ReturnType<typeof processUpdateQueue<State>> = {
		memoizedState: baseState
	};
	if (pendingUpdate !== null) {
		//第一个update
		const first = pendingUpdate.next;
		let pending = pendingUpdate.next as Update<any>;
		do {
			const updateLane = pending.lane;
			if (updateLane === renderLane) {
				const action = pending.action;
				if (action instanceof Function) {
					baseState = action(baseState);
				} else {
					baseState = action;
				}
			} else {
				if (__DEV__) {
					console.error('不应该进入这个逻辑');
				}
			}
			pending = pending?.next as Update<any>;
		} while (pending !== first);
	}
	result.memoizedState = baseState;
	return result;
};
