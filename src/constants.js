export const META_KEY = '__dynamicReducerKey';
export const MULTIREDUCER_INIT_ACTION = { type: '@@multireducer/INIT' };
export const DYNAMIC_REDUCER_INIT_ACTION = key => ({
  type: `@@dynamicReducer/INIT_${key}`
});
