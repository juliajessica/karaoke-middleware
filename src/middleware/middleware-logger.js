const middlewareLogger = store => next => action => {
  console.log('original state:', store.getState());
  console.log('current action:', action);
  next(action); //instructs Redux to continue normal 'workflow'
  console.log('new updated state:', store.getState());
  //unpause & allow action to reach the reducer
};

export default middlewareLogger;
