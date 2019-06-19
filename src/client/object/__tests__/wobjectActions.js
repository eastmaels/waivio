import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as actions from '../wobjectsActions';
import { getObject, getUsersByObject, getFeedContentByObject } from '../../../waivioApi/ApiClient';
import { createPermlink } from '../../vendor/steemitHelpers';
import { getAlbums } from '../../object/ObjectGallery/galleryActions';
import { wObject, obj } from '../_mock_/mockData';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('../../../waivioApi/ApiClient');
jest.mock('../../object/ObjectGallery/galleryActions');
jest.mock('../../vendor/steemitHelpers');

describe('object actions', () => {
  it('should dispatch actions of GET_OBJECT_SUCCESS', () => {
    const expectedActions = [
      {
        type: actions.GET_OBJECT_SUCCESS,
        payload: {},
      },
    ];

    const store = mockStore({});

    store.dispatch(actions.clearObjectFromStore());
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('should dispatch actions of ADD_ITEM_TO_LIST', () => {
    const expectedActions = [
      {
        type: actions.ADD_ITEM_TO_LIST,
        payload: 'Anna123',
      },
    ];

    const store = mockStore({});

    store.dispatch(actions.addListItem('Anna123'));
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('should dispatch actions of GET_OBJECT', () => {
    getObject.mockImplementation(() => wObject);
    const expectedActions = [
      {
        type: actions.GET_OBJECT,
        payload: wObject,
      },
    ];

    const store = mockStore({});

    store.dispatch(actions.getObject('randomValue', 'Anna123'));
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('should dispatch actions of GET_USERS_BY_OBJECT', () => {
    getUsersByObject.mockImplementation(() => wObject);
    const expectedActions = [
      {
        type: actions.GET_USERS_BY_OBJECT.ACTION,
        payload: wObject,
      },
    ];

    const store = mockStore({});

    store.dispatch(actions.getUsersByObject('fti-test3'));
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('should dispatch actions of GET_FEED_CONTENT_BY_OBJECT', () => {
    getFeedContentByObject.mockImplementation(() => obj);
    const expectedActions = [
      {
        type: actions.GET_FEED_CONTENT_BY_OBJECT.ACTION,
        payload: obj,
      },
    ];

    const store = mockStore({});

    store.dispatch(actions.getFeedContentByObject('fti-test3'));
    expect(store.getActions()).toEqual(expectedActions);
  });

  // it('should dispatch actions of getObjectInfo', () => {
  //   const store = mockStore({});
  //   store.dispatch(actions.getObjectInfo('randomValue', 'fti-test3'));
  //   expect(store.getActions()).toEqual('a');
  // });
  //
  // it('should dispatch actions of getObjectInfo', () => {
  //   createPermlink.mockImplementation(() => {});
  //   const postData = {
  //     field: {
  //       locale: 'en-US',
  //       name: 'galleryAlbum',
  //       body: 'galleryAlbumForm',
  //       id: 'randomIdValue',
  //     },
  //     author: 'Ivan',
  //     permlink: 'randomLinkValue',
  //   };
  //
  //   const store = mockStore({});
  //   store.dispatch(actions.createWaivioObject(postData));
  //   expect(store.getActions()).toMatchSnapshot();
  // });
});
