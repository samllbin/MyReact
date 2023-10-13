//打包出来的对应React包
import { Dispatcher, resolveDispatcher } from './src/currentDispather';
import currentDispatcher from './src/currentDispather';
import { jsxDEV } from './src/jsx';

export const useState: Dispatcher['useState'] = (initialState) => {
	//获取当前上下文中所以的hook,并从中拿到useState
	const dispatcher = resolveDispatcher();
	return dispatcher.useState(initialState);
};

//建立内部数据共享层数据共享层,react中名字翻译为中文为,内部数据不要动，东路就会被炒鱿鱼
export const __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = {
	currentDispatcher
};

export default {
	version: '0.0.0',
	createElement: jsxDEV
};
