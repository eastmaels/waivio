import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as actions from '../galleryActions';
import { wObj } from '../__mock__/mockData';
import { getWobjectGallery } from '../../../../waivioApi/ApiClient';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('../../../../waivioApi/ApiClient');

describe('gallery actions', () => {
  it('should dispatch actions of GET_USERS_BY_OBJECT', () => {
    getWobjectGallery.mockImplementation(() => wObj);

    const expectedActions = [
      {
        type: actions.GET_ALBUMS.ACTION,
        payload: wObj,
        meta: { authorPermlink: 'fti-test3' },
      },
    ];

    const store = mockStore({});

    store.dispatch(actions.getAlbums('fti-test3'));
    expect(store.getActions()).toEqual(expectedActions);
  });
});
