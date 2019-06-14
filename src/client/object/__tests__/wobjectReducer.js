import * as actions from '../wobjectsActions';
import { RATE_WOBJECT_SUCCESS } from '../../../client/object/wobjActions';
import wobjectReducer, {
  getObjectState,
  getObjectAuthor,
  getObjectFields,
  getRatingFields,
} from '../wobjectReducer';
import { objectFields } from '../../../common/constants/listOfFields';

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
  it('should add item to itemList on action ADD_ITEM_TO_LIST when state is empty', () => {
    expect(
      wobjectReducer(
        { wobject: { listItems: [] } },
        { type: actions.ADD_ITEM_TO_LIST, payload: 'Anna123' },
      ),
    ).toEqual({
      wobject: { listItems: ['Anna123'] },
    });
  });
  it('should add item to itemList on action ADD_ITEM_TO_LIST when state has value', () => {
    expect(
      wobjectReducer(
        { wobject: { listItems: ['Ivan123'] } },
        { type: actions.ADD_ITEM_TO_LIST, payload: 'Anna123' },
      ),
    ).toEqual({
      wobject: { listItems: ['Ivan123','Anna123'] },
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
  it('should return rated fields state', () => {
    const initialState = {
      wobject: {
        fields: [
          {
            name: objectFields.rating,
            permlink: 'randomValue',
            locale: 'en-US',
          }
        ],
      },
    };
    const actual = [{
      name: objectFields.rating,
      permlink: 'randomValue',
      locale: 'en-US',
    }];
    expect(getRatingFields(initialState)).toEqual(actual);
  });
  it('should return rated wobject on action RATE_WOBJECT_SUCCESS when votes and permlinks are equals', () => {
    const initialState = {
      wobject: {
        fields: [
          {
            name: objectFields.rating,
            permlink: 'randomValue',
            locale: 'en-US',
            rating_votes: [{voter: 'voter'}]
          }
        ],
      },
    };
    const expected = {wobject: {fields: [{locale: "en-US", name: objectFields.rating, permlink: "randomValue", rating_votes: [{rate: "value", voter: "voter"}]}]}};
    expect(wobjectReducer(initialState, { type: RATE_WOBJECT_SUCCESS, payload: {}, meta: {rate : 'value', voter : 'voter', permlink: 'randomValue'} })).toEqual(expected);
  });
  it('should return rated wobject on action RATE_WOBJECT_SUCCESS when votes not equals and permlinks are equals', () => {
    const initialState = {
      wobject: {
        fields: [
          {
            name: objectFields.rating,
            permlink: 'randomValue',
            locale: 'en-US',
            rating_votes: [{voter: 'voter'}]
          }
        ],
      },
    };
    const expected = {wobject: {fields: [{locale: 'en-US', name: objectFields.rating, permlink: 'randomValue', rating_votes: [{voter: "voter"}, {rate: "value", voter: "notEqualVoter"}]}]}};
    expect(wobjectReducer(initialState, { type: RATE_WOBJECT_SUCCESS, payload: {}, meta: {rate : 'value', voter : 'notEqualVoter', permlink: 'randomValue'} })).toEqual(expected);
  });
  it('should return rated wobject on action RATE_WOBJECT_SUCCESS when votes not equals and permlinks are equals', () => {
    const initialState = {
      wobject: {
        fields: [
          {
            name: objectFields.rating,
            permlink: 'randomValue',
            locale: 'en-US',
            rating_votes: [{voter: 'voter'}]
          }
        ],
      },
    };
    const expected = {wobject: {fields: [{locale: 'en-US', name: objectFields.rating, permlink: 'randomValue', rating_votes: [{voter: "voter"}, {rate: "value", voter: "notEqualVoter"}]}]}};
    expect(wobjectReducer(initialState, { type: RATE_WOBJECT_SUCCESS, payload: {}, meta: {rate : 'value', voter : 'notEqualVoter', permlink: 'randomValue'} })).toEqual(expected);
  });
  it('should return rated wobject on action RATE_WOBJECT_SUCCESS when votes equals and permlinks not equals', () => {
    const initialState = {
      wobject: {
        fields: [
          {
            name: objectFields.rating,
            permlink: 'randomValue',
            locale: 'en-US',
            rating_votes: [{voter: 'voter'}]
          }
        ],
      },
    };
    const expected = {wobject: {fields: [{locale: 'en-US', name: objectFields.rating, permlink: 'randomValue', rating_votes: [{voter: "voter"}]}]}};
    expect(wobjectReducer(initialState, { type: RATE_WOBJECT_SUCCESS, payload: {}, meta: {rate : 'value', voter : 'voter', permlink: 'notEqualRandomValue'} })).toEqual(expected);
  });
  it('should return rated wobject on action RATE_WOBJECT_SUCCESS when votes not equals and permlinks not equals', () => {
    const initialState = {
      wobject: {
        fields: [
          {
            name: objectFields.rating,
            permlink: 'randomValue',
            locale: 'en-US',
            rating_votes: [{voter: 'voter'}]
          }
        ],
      },
    };
    const expected = {wobject: {fields: [{locale: 'en-US', name: objectFields.rating, permlink: 'randomValue', rating_votes: [{voter: "voter"}]}]}};
    expect(wobjectReducer(initialState, { type: RATE_WOBJECT_SUCCESS, payload: {}, meta: {rate : 'value', voter : 'notEqualVoter', permlink: 'notEqualRandomValue'} })).toEqual(expected);
  });
});
