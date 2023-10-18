const isSupportSymbol = typeof Symbol === 'function' && Symbol.for;
export const REACT_ELEMENT_TYPE = isSupportSymbol
	? Symbol.for('react.element')
	: 0xeac7;

export const REACT_FRAGMENT_TYPE = isSupportSymbol
	? Symbol.for('react.fragment')
	: 0xeacb;
