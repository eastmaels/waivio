import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import React from 'react';
import InterestingObjects from '../InterestingObjects';
import * as reducers from '../../../reducers';
import * as actions from '../../../user/userActions';
import { shallowWithStore, mountWithStore } from '../__tests__/shallowWrapper';

const mockStore = configureMockStore([thunk]);
const store = mockStore({});

jest.mock('../../../../waivioApi/ApiClient');

describe('<InterestingObjects />', () => {
  const propsComponent = {
    recommendedObjects: [
      {
        __v: 0,
        _id: '5caf424c6fb6c810cde66d6b',
        app: 'waiviodev/1.0.0',
        author: 'suy38',
        author_permlink: 'life',
        community: '',
        createdAt: '2019-04-11T13:34:04.222Z',
        creator: 'wiv01',
        default_name: 'life',
        is_extending_open: true,
        is_posting_open: true,
        object_type: 'hashtag',
        parent: '',
        rank: 8,
        updatedAt: '2019-06-18T11:33:16.621Z',
        user_count: 5,
        weight: 32967838660.60074,
      },
      {
        __v: 0,
        _id: '5caf43596fb6c810cde6b716',
        app: 'waiviodev/1.0.0',
        author: 'q1w2c',
        author_permlink: 'busy',
        community: '',
        createdAt: '2019-04-11T13:38:33.125Z',
        creator: 'wiv01',
        default_name: 'busy',
        is_extending_open: true,
        is_posting_open: true,
        object_type: 'hashtag',
        parent: '',
        rank: 7,
        updatedAt: '2019-06-18T11:33:17.199Z',
        user_count: 5,
        weight: 30582410090.73522,
      },
    ],
  };

  it('renders component without crashing', () => {
    const component = shallowWithStore(<InterestingObjects {...propsComponent} />, store);
    expect(component).toMatchSnapshot();
  });

  it('should render page if quote exist', () => {
    reducers.getRecommendedObjects = jest.fn(() => new Array(5));
    const component = mountWithStore(<InterestingObjects {...propsComponent} />, store);
    const mainDiv = component.find('.InterestingObjects');
    expect(mainDiv).toHaveLength(1);
  });

  it('should not call getRecommendedObj if recomended objects not less then 5', async () => {
    reducers.getRecommendedObjects = jest.fn(() => new Array(5));
    actions.getRecommendedObj = jest.fn(() => Promise.resolve());
    const mounted = mountWithStore(<InterestingObjects />, store);
    expect(actions.getRecommendedObj).toHaveBeenCalledTimes(0);
  });

  it('should call getRecommendedObj if recomended objects less then 5', async () => {
    const mockGetRecommendedObj = jest.fn(() => Promise.resolve());
    reducers.getRecommendedObjects = jest.fn(() => new Array(4));
    mountWithStore(<InterestingObjects />, store);
    expect(mockGetRecommendedObj).toHaveBeenCalledTimes(1);
  });
});
