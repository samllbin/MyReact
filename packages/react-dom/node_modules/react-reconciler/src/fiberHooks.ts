import { FiberNode } from './fiber';

//执行函数式组件的函数，并且返回其children
export function renderWithHooks(wip: FiberNode) {
	//函数式组件的函数保存在该对应fiber的type上
	const Component = wip.type;
	const props = wip.pendingProps;
	const children = Component(props);

	return children;
}
