import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { message } from 'antd';
import Cookie from 'js-cookie';
import steemConnectAPI from './steemConnectAPI';
import history from './history';
import getStore from './store';
import AppHost from './AppHost';
import { getBrowserLocale, loadLanguage } from './translations';
import { setScreenSize, setUsedLocale } from './app/appActions';
import { getLocale } from './reducers';

if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  navigator.serviceWorker.register('/service-worker.js');
}

const accessToken = Cookie.get('access_token');
if (accessToken) {
  steemConnectAPI.setAccessToken(accessToken);
}

const store = getStore(steemConnectAPI);

message.config({
  top: 62,
  duration: 3,
});

const render = async Component => {
  const state = store.getState();

  const userLocale = getLocale(state);

  let activeLocale = userLocale;
  if (activeLocale === 'auto') {
    activeLocale = Cookie.get('language') || getBrowserLocale() || 'en-US';
  }

  const lang = await loadLanguage(activeLocale);
  const screenSize = width => {
    if (width < 400) return 'xsmall';
    if (width < 768) return 'small';
    if (width < 998) return 'medium';
    return 'large';
  };
  store.dispatch(setUsedLocale(lang));
  store.dispatch(setScreenSize(screenSize(window.screen.width)));
  window.addEventListener('resize', () =>
    store.dispatch(setScreenSize(screenSize(window.screen.width))),
  );

  ReactDOM.hydrate(
    <Provider store={store}>
      <Component history={history} />
    </Provider>,
    document.getElementById('app'),
  );
};

render(AppHost);
