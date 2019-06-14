import * as actions from '../wobjectsActions';
import wobjectReducer, {
  getObjectState,
  getObjectAuthor,
  getObjectFields,
  getRatingFields,
} from '../wobjectReducer';

describe('object Reducer', () => {
  it('should return the initial state', () => {
    expect(wobjectReducer(undefined, [])).toEqual({
      wobject: {},
      isFetching: false,
    });
  });
  it('should set isFetching true if GET_OBJECT_START', () => {
    expect(wobjectReducer([], { type: actions.GET_OBJECT_START })).toEqual({
      isFetching: true,
    });
  });
  it('should set isFetching false if GET_OBJECT_ERROR', () => {
    expect(wobjectReducer([], { type: actions.GET_OBJECT_ERROR })).toEqual({
      isFetching: false,
    });
  });
  it('should set isFetching false if GET_OBJECT_SUCCESS', () => {
    expect(wobjectReducer([], { type: actions.GET_OBJECT_SUCCESS, payload: {} })).toEqual({
      wobject: {},
      isFetching: false,
    });
  });
  it('should add item to itemList on action ADD_ITEM_TO_LIST', () => {
    expect(
      wobjectReducer(
        { wobject: { listItems: [] } },
        { type: actions.ADD_ITEM_TO_LIST, payload: 'Anna123' },
      ),
    ).toEqual({
      wobject: { listItems: ['Anna123'] },
    });
  });
  it('should return wobject state', () => {
    const initialState = { wobject: {}, isFetching: false };
    expect(getObjectState(initialState)).toEqual({});
  });
  it('should return author state', () => {
    const initialState = { wobject: {}, isFetching: false, author: 'Ivan' };
    expect(getObjectAuthor(initialState)).toEqual('Ivan');
  });
  it('should return fields state', () => {
    const initialState = {
      wobject: {
        fields: {
          name: 'Ivan',
          permlink: 'randomValue',
          locale: 'en-US',
        },
      },
    };
    const actual = {
      name: 'Ivan',
      permlink: 'randomValue',
      locale: 'en-US',
    };
    expect(getObjectFields(initialState)).toEqual(actual);
  });
  it('should return fields state', () => {
    const initialState = {
      wobject: {
        fields: {
          name: 'Ivan',
          permlink: 'randomValue',
          locale: 'en-US',
        },
      },
    };
    const actual = {
      name: 'Ivan',
      permlink: 'randomValue',
      locale: 'en-US',
    };
    expect(getRatingFields(initialState)).toEqual(actual);
  });
});
