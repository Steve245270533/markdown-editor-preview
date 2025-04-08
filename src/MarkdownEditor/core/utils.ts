export const noop = () => {};

export const identity = <T>(v: T) => v;

export const silencePromise = <T>(value: Promise<T>) => {
  if (typeof value?.then === "function") value.catch(noop);
};
