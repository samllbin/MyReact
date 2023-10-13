import { useState } from 'react';
import ReactDOM from 'react-dom/client';

function App() {
	const [num] = useState(100);
	return (
		<div>
			<sapn>{num}</sapn>
		</div>
	);
}
ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
