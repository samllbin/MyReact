import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

function App() {
	// const [num, update] = useState(100);
	const [add, setAdd] = useState(1);
	return (
		<div
			onClickCapture={() => {
				// update((num) => num + 1);
				// update((num) => num + 1);
				// update((num) => num + 1);
				setAdd((add) => add + 1);
				setAdd((add) => add + 1);
				setAdd((add) => add + 1);
				setAdd((add) => add + 1);
			}}
		>
			{/* {num} */}
			{add}
		</div>
	);
}

const root = ReactDOM.createRoot(document.querySelector('#root'));

root.render(<App />);
