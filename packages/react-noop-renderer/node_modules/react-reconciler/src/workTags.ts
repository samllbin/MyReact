export type WorkTag =
	| typeof FunctionComponent
	| typeof HostRoot
	| typeof HostComponent
	| typeof HostText
	| typeof Fragment
	| typeof ContextProvider;

export const FunctionComponent = 0;
export const HostRoot = 3;
//<span></span>
export const HostComponent = 5;
//abc
export const HostText = 6;
export const Fragment = 7;
export const ContextProvider = 8;
