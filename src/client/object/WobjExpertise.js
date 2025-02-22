import React from 'react';
import PropTypes from 'prop-types';
import { getWobjectsExpertise } from '../../waivioApi/ApiClient';
import UserDynamicList from '../user/UserDynamicList';

export default class WobjExpertise extends React.Component {
  static propTypes = {
    match: PropTypes.shape().isRequired,
  };

  static limit = 30;

  fetcher = skip => {
    const { match } = this.props;
    return getWobjectsExpertise(match.params.name, skip.length, WobjExpertise.limit);
  };

  render() {
    return <UserDynamicList limit={WobjExpertise.limit} fetcher={this.fetcher} />;
  }
}
