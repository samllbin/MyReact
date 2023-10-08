import { Props, Key, Ref } from 'shared/ReactTypes';
import { WorkTag } from './workTags';
import { Flags, NoFlags } from './fiberFlags';

export class fiberNode {
	type: any;
	tag: WorkTag;
	pendingProps: Props;
	key: Key;
	stateNode: any;

	return: fiberNode | null;
	sibling: fiberNode | null;
	child: fiberNode | null;
	ref: Ref;
	index: number;

	memoizedProps: Props | null;
	alternate: fiberNode | null;
	flags: Flags;

	constructor(tag: WorkTag, pendingProps: Props, key: Key) {
		//实例属性
		this.tag = tag;
		this.key = key;
		//其对应的DOM
		this.stateNode = null;
		this.type = null;

		//父级fiberNode
		this.return = null;
		//右边的兄弟fiberNode
		this.sibling = null;
		//子fiberNode
		this.child = null;
		//当前同级的位置索引
		this.index = 0;

		this.ref = null;

		//工作单元
		this.pendingProps = pendingProps;
		this.memoizedProps = null;

		this.alternate = null;
		//副作用
		this.flags = NoFlags;
	}
}
