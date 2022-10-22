const promiseWithTimeout = (
  ms: number,
  promise: Promise<unknown>,
  timeoutMessage?: string
): Promise<unknown> => {
  const timeoutPromise = new Promise((_, reject) => {
    const timeoutId = setTimeout(() => {
      clearTimeout(timeoutId);
      reject(new Error(timeoutMessage ?? "Request timed out"));
    }, ms);
  });
  return Promise.race([promise, timeoutPromise]);
};

export default promiseWithTimeout;
