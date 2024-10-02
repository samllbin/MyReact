import { useState, useTransition } from 'react';
import ReactDOM from 'react-dom/client';

function App() {
	const [state, setState] = useState(1);
	const [isPending, startTransition] = useTransition();
	return (
		<div
			className="App"
			onClick={() => {
				setState('1');
				startTransition(() => {
					setState((s) => s + '2');
				});
				setState((s) => s + '3');
				startTransition(() => {
					setState((s) => s + '4');
				});
			}}
		>
			{state}
		</div>
	);
}
13;
1234;

const element = ReactDOM.createRoot(
	document.getElementById('root') as HTMLElement
).render(<App />);
console.log('element ' + JSON.stringify(element));
