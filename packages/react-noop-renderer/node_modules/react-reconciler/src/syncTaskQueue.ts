let syncQueue: ((...args: any) => void)[] | null = null;
let isFlushingSyncQueue = false;

//调度同步的任务回调函数
export function scheduleSyncCallback(callback: (...args: any) => void) {
	if (syncQueue === null) {
		syncQueue = [callback];
	} else {
		syncQueue.push(callback);
	}
}

//执行同步的回调函数
export function flushSyncCallbacks() {
	if (!isFlushingSyncQueue && syncQueue) {
		isFlushingSyncQueue = true;
		try {
			syncQueue.forEach((callbackk) => callbackk());
		} catch (e) {
			if (__DEV__) {
				console.error('flushSyncCallbacks报错', e);
			}
		} finally {
			isFlushingSyncQueue = false;
			syncQueue = null;
		}
	}
}
