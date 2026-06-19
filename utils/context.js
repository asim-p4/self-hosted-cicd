import { AsyncLocalStorage } from "async_hooks";

const asyncLocalStorage = new AsyncLocalStorage();

export function runWithContext(requestData, callback) {
  return asyncLocalStorage.run(requestData, callback);
}

export function getContext() {
  return asyncLocalStorage.getStore();
}
