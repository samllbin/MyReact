import { Props, ReactElementType } from 'shared/ReactTypes';
import {
	FiberNode,
	createFiberFromElement,
	createWorkInProgress,
	createFiberFromFragment
} from './fiber';
import { REACT_ELEMENT_TYPE, REACT_FRAGMENT_TYPE } from 'shared/ReactSymbols';
import { HostText } from './workTags';
import { ChildDeletion, Placement } from './fiberFlags';
import { Fragment } from './workTags';
import { Key } from 'shared/ReactTypes';
type ExistingChildren = Map<string | number, FiberNode>;

//shouldTrackEffects:是否追踪副作用
function ChildReconciler(shouldTrackEffects: boolean) {
	//标记删除子节点的函数
	function deleteChild(returnFiber: FiberNode, childToDelete: FiberNode) {
		if (!shouldTrackEffects) {
			return;
		}
		const deletions = returnFiber.deletions;
		if (deletions === null) {
			returnFiber.deletions = [childToDelete];
			returnFiber.flags |= ChildDeletion;
		} else {
			deletions.push(childToDelete);
		}
	}

	//标记删除同级的节点
	function deleteRemainingChildren(
		returnFiber: FiberNode,
		currentFirstChild: FiberNode | null
	) {
		if (!shouldTrackEffects) {
			return;
		}
		let childToDelete = currentFirstChild;
		while (childToDelete !== null) {
			deleteChild(returnFiber, childToDelete);
			childToDelete = childToDelete.sibling;
		}
	}

	function reconcileSingleElement(
		returnFiber: FiberNode,
		currentFiber: FiberNode | null,
		element: ReactElementType
	) {
		const key = element.key;
		while (currentFiber !== null) {
			//update
			if (currentFiber.key === key) {
				//key相同
				if (element.$$typeof === REACT_ELEMENT_TYPE) {
					if (currentFiber.type === element.type) {
						let props = element.props;
						if (element.type === REACT_FRAGMENT_TYPE) {
							props = element.props.children;
						}
						//type相同
						const existing = useFiber(currentFiber, props);
						existing.return = returnFiber;
						//当前节点可复用，标记其他节点删除
						deleteRemainingChildren(returnFiber, currentFiber.sibling);
						return existing;
					}
					//key相同，type不同,不存在任何复用的可能性，删掉所有旧的
					deleteRemainingChildren(returnFiber, currentFiber);

					break;
				} else {
					if (__DEV__) {
						console.warn('还未实现的React类型', element);
						break;
					}
				}
			} else {
				//key不同,删除当前的fiber，继续遍历sibling
				deleteChild(returnFiber, currentFiber);
				currentFiber = currentFiber.sibling;
			}
		}

		//根据ReactElement创建一个fiber然后返回
		let fiber;
		if (element.type === REACT_FRAGMENT_TYPE) {
			fiber = createFiberFromFragment(element.props.children, key);
		} else {
			fiber = createFiberFromElement(element);
		}
		fiber.return = returnFiber;
		return fiber;
	}

	function reconcileSingeTextNode(
		returnFiber: FiberNode,
		currentFiber: FiberNode | null,
		content: string | number
	) {
		while (currentFiber !== null) {
			//update
			if (currentFiber.tag === HostText) {
				//类型未变
				const existing = useFiber(currentFiber, { content });
				existing.return = returnFiber;
				deleteRemainingChildren(returnFiber, currentFiber.sibling);
				return existing;
			}
			deleteChild(returnFiber, currentFiber);
			currentFiber = currentFiber.sibling;
		}
		const fiber = new FiberNode(HostText, { content }, null);
		fiber.return = returnFiber;
		return fiber;
	}

	//插入单一的节点
	function placeSingleChild(fiber: FiberNode) {
		if (shouldTrackEffects && fiber.alternate === null) {
			fiber.flags |= Placement;
		}
		return fiber;
	}

	//多节点遍历
	function reconcileChildrenArray(
		returnFiber: FiberNode,
		currentFirstChild: FiberNode | null,
		newChild: any[]
	) {
		//最后一个可复用fiber在current中的值
		let lastPlaceIndex: number = 0;
		//创建的最后一个fiber
		let lastNewFiber: FiberNode | null = null;
		//创建的第一个fiber
		let firstNewFiber: FiberNode | null = null;

		//将current保存在map中
		const existingChildren: ExistingChildren = new Map();
		let current = currentFirstChild;
		while (current !== null) {
			const keyToUse = current.key !== null ? current.key : current.index;
			existingChildren.set(keyToUse, current);
			current = current.sibling;
		}

		for (let i = 0; i < newChild.length; i++) {
			//遍历newChild，寻找是否可复用
			const after = newChild[i];

			const newFiber = updateFromMap(returnFiber, existingChildren, i, after);

			if (newFiber === null) {
				continue;
			}
			//标记移动还是插入
			newFiber.index = i;
			newFiber.return = returnFiber;

			if (lastNewFiber === null) {
				lastNewFiber = newFiber;
				firstNewFiber = newFiber;
			} else {
				lastNewFiber.sibling = newFiber;
				lastNewFiber = lastNewFiber.sibling;
			}

			if (!shouldTrackEffects) {
				continue;
			}

			const current = newFiber.alternate;
			if (current !== null) {
				const oldIndex = current.index;
				if (oldIndex < lastPlaceIndex) {
					newFiber.flags |= Placement;
					continue;
				} else {
					//不移动
					lastPlaceIndex = oldIndex;
				}
			} else {
				//mount
				newFiber.flags |= Placement;
			}
		}

		//将map中的全部标记为删除
		existingChildren.forEach((fiber) => {
			deleteChild(returnFiber, fiber);
		});
		return firstNewFiber;
	}

	function getElementKeyToUse(element: any, index?: number): Key {
		if (
			Array.isArray(element) ||
			typeof element === 'string' ||
			typeof element === 'number' ||
			element === undefined ||
			element === null
		) {
			return index;
		}
		return element.key !== null ? element.key : index;
	}

	//判断map中是否存可复用
	function updateFromMap(
		returnFiber: FiberNode,
		existingChildren: ExistingChildren,
		index: number,
		element: any
	): FiberNode | null {
		const keyToUse = getElementKeyToUse(element, index);
		const before = existingChildren.get(keyToUse);

		//HostText
		if (typeof element === 'string' || typeof element === 'number') {
			if (before) {
				if (before.tag === HostText) {
					existingChildren.delete(keyToUse);
					return useFiber(before, { content: element + '' });
				}
			}
			return new FiberNode(HostText, { content: element + '' }, null);
		}

		//ReactElement
		if (typeof element === 'object' && element !== null) {
			switch (element.$$typeof) {
				case REACT_ELEMENT_TYPE:
					if (element.type === REACT_FRAGMENT_TYPE) {
						return updateFragment(
							returnFiber,
							before,
							element,
							keyToUse,
							existingChildren
						);
					}
					if (before) {
						if (before.type === element.type) {
							existingChildren.delete(keyToUse);
							return useFiber(before, element.props);
						}
					}
					return createFiberFromElement(element);
			}

			// TODO:数组类型
			if (Array.isArray(element) && __DEV__) {
				console.warn('还未是按数组类型的child');
			}
		}

		if (Array.isArray(element)) {
			return updateFragment(
				returnFiber,
				before,
				element,
				keyToUse,
				existingChildren
			);
		}
		return null;
	}

	return function reconcileChildFibers(
		returnFiber: FiberNode,
		currentFiber: FiberNode | null,
		newChild?: any
	) {
		//判断fragment
		const isUnkeyedTopLevelFragment =
			typeof newChild === 'object' &&
			newChild !== null &&
			newChild.type === REACT_FRAGMENT_TYPE &&
			newChild.key === null;
		//无key且为根节点
		if (isUnkeyedTopLevelFragment) {
			newChild = newChild.props.children;
		}
		//判断当前fiber的类型
		if (typeof newChild === 'object' && newChild !== null) {
			//多节点
			if (Array.isArray(newChild)) {
				return reconcileChildrenArray(returnFiber, currentFiber, newChild);
			}
			switch (newChild.$$typeof) {
				case REACT_ELEMENT_TYPE:
					return placeSingleChild(
						reconcileSingleElement(returnFiber, currentFiber, newChild)
					);

				default:
					if (__DEV__) {
						console.warn('未实现的reconcile类型', newChild);
					}
			}
		}

		//HostText
		if (typeof newChild === 'string' || typeof newChild === 'number') {
			return placeSingleChild(
				reconcileSingeTextNode(returnFiber, currentFiber, newChild)
			);
		}
		if (currentFiber !== null) {
			//兜底删除
			deleteRemainingChildren(returnFiber, currentFiber);
		}
		if (__DEV__) {
			console.warn('未实现的reconcile类型', newChild);
		}
		return null;
	};
}

//复用fiber的函数
function useFiber(fiber: FiberNode, pendingProps: Props): FiberNode {
	//这个createWorkInProgress不会创建新的fiberNode，而是更新一下状态
	const clone = createWorkInProgress(fiber, pendingProps);
	clone.index = 0;
	clone.sibling = null;
	return clone;
}

function updateFragment(
	returnFiber: FiberNode,
	current: FiberNode | undefined,
	elements: any[],
	key: Key,
	existingChildren: ExistingChildren
) {
	let fiber;
	if (!current || current.tag !== Fragment) {
		fiber = createFiberFromFragment(elements, key);
	} else {
		existingChildren.delete(key);
		fiber = useFiber(current, elements);
	}

	fiber.return = returnFiber;
	return fiber;
}

export const reconcileChildFibers = ChildReconciler(true);
export const mountChildFibers = ChildReconciler(false);
