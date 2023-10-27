//打包出来的对应React包
import { Dispatcher, resolveDispatcher } from './src/currentDispather';
import currentDispatcher from './src/currentDispather';
import CurrentBatchConfig from './src/currentBatchConfig';
import { jsxDEV, jsx, isValidElement as isValidElementFn } from './src/jsx';
export { createContext } from './src/context';

export const useState: Dispatcher['useState'] = (initialState) => {
	//获取当前上下文中所以的hook,并从中拿到useState
	const dispatcher = resolveDispatcher();
	return dispatcher.useState(initialState);
};

export const useEffect: Dispatcher['useEffect'] = (create, deps) => {
	const dispatcher = resolveDispatcher();
	return dispatcher.useEffect(create, deps);
};
export const useTransition: Dispatcher['useTransition'] = () => {
	const dispatcher = resolveDispatcher();
	return dispatcher.useTransition();
};
export const useRef: Dispatcher['useRef'] = (initialValue) => {
	const dispatcher = resolveDispatcher();
	return dispatcher.useRef(initialValue);
};
export const useContext: Dispatcher['useContext'] = (context) => {
	const dispatcher = resolveDispatcher();
	return dispatcher.useContext(context);
};

//建立内部数据共享层数据共享层,react中名字翻译为中文为,内部数据不要动，动了就会被炒鱿鱼
export const __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = {
	currentDispatcher,
	CurrentBatchConfig
};

export const version = '0.0.0';

//TODO根据环境区分使用jsx还是jsxDEV
export const createElement = jsx;

export const isValidElement = isValidElementFn;
