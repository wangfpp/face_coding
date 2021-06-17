import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk'
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import combinReducer from './reducer/index';
import { initState } from './actions/action_type_initstate.js';
import { storeName } from '../utils/config.js';
const persistConf = {
    key: storeName,
    storage,
    // blacklist: ['activeMenu'] // 黑名单 不进行持久化缓存
};


const composeEnhancers =
  typeof window === 'object' &&
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?   
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
      // Specify extension’s options like name, actionsBlacklist, actionsCreators, serialize...
    }) : compose;

const enhancer = composeEnhancers(
  applyMiddleware(thunk),
  // other store enhancers if any
);

const persistedReducer = persistReducer(persistConf, combinReducer);
const StorePersistor =() => {
  let store = createStore(
      persistedReducer, 
      initState, 
      enhancer
  );
  let persistor = persistStore(store);
  return { store, persistor};
}
export default StorePersistor;