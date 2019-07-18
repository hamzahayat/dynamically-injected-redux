import { combineReducers } from 'redux';
import { MULTIREDUCER_INIT_ACTION, META_KEY } from './constants';

export function mapValues(obj, fn) {
  return Object.keys(obj).reduce(
    (accumulator, key) => ({
      ...accumulator,
      [key]: fn(obj[key], key)
    }),
    {}
  );
}

export function plainMultireducer(reducers, reducerKey) {
  let isCustomMountPoint;
  if (typeof reducers === 'function') {
    if (!reducerKey) {
      throw new Error('No key specified for custom mounting of reducer');
    } else {
      isCustomMountPoint = true;
    }
  }

  const initialState = isCustomMountPoint
    ? reducers(undefined, MULTIREDUCER_INIT_ACTION)
    : mapValues(reducers, reducer => reducer(undefined, MULTIREDUCER_INIT_ACTION));

  return (state = initialState, action) => {
    if (action && action.meta && action.meta[META_KEY]) {
      const actionReducerKey = action.meta[META_KEY];

      // custom mount point
      if (isCustomMountPoint && reducerKey === actionReducerKey) {
        return reducers(state, action);
      }

      // usual multireducer mounting
      const reducer = reducers[actionReducerKey];

      if (reducer) {
        return {
          ...state,
          [actionReducerKey]: reducer(state[actionReducerKey], action)
        };
      }
    }

    return state;
  };
}

const createReducerManager = initialReducers => {
  const reducers = { ...initialReducers };
  let combinedReducer = combineReducers(reducers);

  let keysToRemove = [];
  const dynamicReducers = {};

  return {
    getReducerMap: () => reducers,

    reduce: (state, action) => {
      if (keysToRemove.length > 0) {
        state = { ...state };
        for (const key of keysToRemove) delete state[key];
        keysToRemove = [];
      }

      return combinedReducer(state, action);
    },

    add: (key, reducerName, reducer) => {
      if (!key || reducers[key]) return;

      reducers[reducerName] = plainMultireducer({
        [key]: reducer,
        ...dynamicReducers[reducerName]
      });

      dynamicReducers[reducerName] = {
        ...dynamicReducers[reducerName],
        [key]: reducer
      };

      combinedReducer = combineReducers(reducers);
    },

    remove: (key, reducerName) => {
      if (!key || !reducers[key]) return;

      delete reducers[key];
      delete dynamicReducers[reducerName][key];

      keysToRemove.push(key);
      combinedReducer = combineReducers(reducers);
    }
  };
};

export default createReducerManager;
