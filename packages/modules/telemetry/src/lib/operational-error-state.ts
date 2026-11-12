/** Weak classifications shared across scopes without retaining or mutating business errors. */
export const operationalErrorState = {
  cancellations: new WeakSet<object>(),
  reasons: new WeakMap<object, string>(),
};
