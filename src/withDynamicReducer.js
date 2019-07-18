import React, { PureComponent } from 'react';
import { ReactReduxContext } from 'react-redux';
import { DYNAMIC_REDUCER_INIT_ACTION } from './constants';

const getIdentifier = (
  name,
  reducer,
  key = Math.random()
    .toString(36)
    .substr(2, 9)
) => (name !== undefined ? `${name}__${key}` : `${reducer.prototype.constructor.name}__${key}`);

const withDynamicReducer = (reducer = null, key = null, reducerName = null) => ComponentToWrap => {
  class DynamicReducerComponent extends PureComponent {
    constructor(props, context) {
      super(props, context);
      let { store } = context;

      const keyToUse =
        key ||
        Math.random()
          .toString(36)
          .substr(2, 9);

      if (reducer !== null) {
        this.reducerName = reducerName || reducer.name || reducer.prototype.constructor.name;
        this.identifier = getIdentifier(this.reducerName, reducer, keyToUse);

        store.reducerManager.add(this.identifier, this.reducerName, reducer);
        store.dispatch(DYNAMIC_REDUCER_INIT_ACTION(this.identifier));
      }
    }

    componentWillUnmount() {
      let { store } = this.context;
      if (reducer !== null && this.identifier && this.reducerName)
        store.reducerManager.remove(this.identifier, this.reducerName);
    }

    render() {
      return <ComponentToWrap {...this.props} identifier={this.identifier} />;
    }
  }

  DynamicReducerComponent.contextType = ReactReduxContext;

  return DynamicReducerComponent;
};

export default withDynamicReducer;
