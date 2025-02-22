import _ from 'lodash';
import { createAsyncActionType } from '../helpers/stateHelpers';
import { getAccountReputation, getAllSearchResultPages } from '../helpers/apiHelpers';
import * as ApiClient from '../../waivioApi/ApiClient';

export const SEARCH_ASK_STEEM = createAsyncActionType('@search/SEARCH_ASK_STEEM');
export const AUTO_COMPLETE_SEARCH = createAsyncActionType('@search/AUTO_COMPLETE_SEARCH');
export const SEARCH_OBJECTS = createAsyncActionType('@search/SEARCH_OBJECTS');
export const CLEAR_SEARCH_OBJECTS_RESULT = '@search/CLEAR_SEARCH_OBJECTS_RESULT';

export const searchAskSteem = search => dispatch =>
  dispatch({
    type: SEARCH_ASK_STEEM.ACTION,
    payload: {
      promise: Promise.all([
        getAllSearchResultPages(search)
          .then(response => {
            let mergedResults = [];
            _.each(response, element => {
              mergedResults = _.concat(mergedResults, element.results);
            });
            return _.reverse(_.sortBy(mergedResults, ['type', 'created']));
          })
          .catch(() => []),
        getAccountReputation(search),
      ]),
    },
  });

export const searchAutoComplete = (search, userLimit, wobjectsLimi, objectTypesLimit) => dispatch =>
  dispatch({
    type: AUTO_COMPLETE_SEARCH.ACTION,
    payload: {
      promise: ApiClient.getSearchResult(search, userLimit, wobjectsLimi, objectTypesLimit).then(
        result => ({
          result,
          search,
        }),
      ),
    },
  });

export const searchObjectsAutoCompete = (searchString, objType) => dispatch =>
  dispatch({
    type: SEARCH_OBJECTS.ACTION,
    payload: {
      promise: ApiClient.searchObjects(searchString, objType).then(result => ({
        result,
        search: searchString,
      })),
    },
  });

export const clearSearchObjectsResults = () => dispatch =>
  dispatch({
    type: CLEAR_SEARCH_OBJECTS_RESULT,
  });
