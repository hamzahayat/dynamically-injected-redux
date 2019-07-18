import { bindActionCreators as originalBindActionCreator } from 'redux';
import { META_KEY } from './constants';

export const wrapAction = (action, reducerKey) => ({
  ...action,
  meta: {
    ...action.meta,
    [META_KEY]: reducerKey
  }
});

export const wrapDispatch = (dispatch, reducerKey) => action => {
  let wrappedAction;
  if (typeof action === 'function') {
    wrappedAction = (globalDispatch, getState, extraArgument) =>
      action(wrappedDispatch, getState, globalDispatch, reducerKey, extraArgument);
  } else if (typeof action === 'object') {
    wrappedAction = wrapAction(action, reducerKey);
  }
  return dispatch(wrappedAction);
};

const getBindedAction = (actionCreators, dispatch, reducerKey) => {
  const wrappedDispatch = wrapDispatch(dispatch, reducerKey);
  return originalBindActionCreator(actionCreators, wrappedDispatch);
};

export const bindActionCreators = (actionCreators, dispatch, reducerKey) => {
  if (dispatch && reducerKey) return getBindedAction(actionCreators, dispatch, reducerKey);

  return (dispatch, { identifier: reducerKey }) => {
    return getBindedAction(actionCreators, dispatch, reducerKey);
  };
};
