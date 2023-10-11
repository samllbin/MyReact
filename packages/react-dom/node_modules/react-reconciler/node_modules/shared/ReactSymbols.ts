const isSupportSymbol = typeof Symbol === 'function' && Symbol.for;
const REACT_ELEMENT_TYPE = isSupportSymbol
	? Symbol.for('react.element')
	: 0xeac7;
export default REACT_ELEMENT_TYPE;
