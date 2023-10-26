import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

function App() {
	const [num, update] = useState(100);
	return (
		<div
			onClickCapture={() => {
				update((num) => num + 1);
				update((num) => num + 1);
				update((num) => num + 1);
			}}
		>
			{num}
		</div>
	);
}

const root = ReactDOM.createRoot(document.querySelector('#root'));

root.render(<App />);
