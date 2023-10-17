//不引入当前目录下的createRoot的原因是：在测试时我们会单独引入utils包,作为外部依赖
// @ts-ignore
import { createRoot } from 'react-dom';

// @ts-ignore
export function renderIntoDocument(element) {
	const div = document.createElement('div');
	return createRoot(div).render(element);
}
