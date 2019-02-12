import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Route, Switch, withRouter } from 'react-router-dom';
import {
  getIsAuthenticated,
  getAuthenticatedUser,
  getIsAuthFetching,
  getRecommendations,
  getFollowingList,
  getIsFetchingFollowingList,
  getRecommendedObjects,
} from '../../reducers';
import { updateRecommendations } from '../../user/userActions';
import InterestingPeople from '../../components/Sidebar/InterestingPeople';
import InterestingObjects from '../../components/Sidebar/InterestingObjects';
import InterestingPeopleWithAPI from '../../components/Sidebar/InterestingPeopleWithAPI';
import SignUp from '../../components/Sidebar/SignUp';
import PostRecommendation from '../../components/Sidebar/PostRecommendation';
import Loading from '../../components/Icon/Loading';
import UserActivitySearch from '../../activity/UserActivitySearch';
import WalletSidebar from '../../components/Sidebar/WalletSidebar';
import FeedSidebar from '../../components/Sidebar/FeedSidebar';
import RightSidebarLoading from './RightSidebarLoading';

@withRouter
@connect(
  state => ({
    authenticated: getIsAuthenticated(state),
    authenticatedUser: getAuthenticatedUser(state),
    isAuthFetching: getIsAuthFetching(state),
    recommendations: getRecommendations(state),
    followingList: getFollowingList(state),
    isFetchingFollowingList: getIsFetchingFollowingList(state),
    recommendedObjects: getRecommendedObjects(state),
  }),
  {
    updateRecommendations,
  },
)
export default class RightSidebar extends React.Component {
  static propTypes = {
    authenticated: PropTypes.bool.isRequired,
    authenticatedUser: PropTypes.shape().isRequired,
    isAuthFetching: PropTypes.bool.isRequired,
    showPostRecommendation: PropTypes.bool,
    recommendations: PropTypes.arrayOf(PropTypes.shape({ name: PropTypes.string })).isRequired,
    recommendedObjects: PropTypes.arrayOf(PropTypes.shape({ tag: PropTypes.string })).isRequired,
    updateRecommendations: PropTypes.func,
    followingList: PropTypes.arrayOf(PropTypes.string).isRequired,
    isFetchingFollowingList: PropTypes.bool.isRequired,
  };

  static defaultProps = {
    showPostRecommendation: false,
    updateRecommendations: () => {},
    recommendedObjects: [],
  };

  handleInterestingPeopleRefresh = () => this.props.updateRecommendations();

  render() {
    const {
      authenticated,
      authenticatedUser,
      showPostRecommendation,
      isAuthFetching,
      followingList,
      isFetchingFollowingList,
      recommendedObjects,
    } = this.props;

    if (isAuthFetching) {
      return <Loading />;
    }

    return (
      <div>
        {!authenticated && <SignUp />}
        <Switch>
          <Route path="/activity" component={UserActivitySearch} />
          <Route path="/@:name/activity" component={UserActivitySearch} />
          <Route path="/@:name/transfers" render={() => <WalletSidebar />} />
          <Route path="/trending/:tag" component={FeedSidebar} />
          <Route path="/created/:tag" component={FeedSidebar} />
          <Route path="/hot/:tag" component={FeedSidebar} />
          <Route path="/promoted/:tag" component={FeedSidebar} />
          <Route
            path="/@:name"
            render={() =>
              authenticated && (
                <InterestingPeopleWithAPI
                  authenticatedUser={authenticatedUser}
                  followingList={followingList}
                  isFetchingFollowingList={isFetchingFollowingList}
                />
              )
            }
          />
          <Route
            path="/"
            render={() => (
              <div>
                {authenticated && _.size(recommendedObjects) > 0 ? (
                  <InterestingObjects objects={recommendedObjects} />
                ) : (
                  <RightSidebarLoading />
                )}
                {authenticated &&
                this.props.recommendations.length > 0 &&
                !showPostRecommendation ? (
                  <InterestingPeople
                    users={this.props.recommendations}
                    onRefresh={this.handleInterestingPeopleRefresh}
                  />
                ) : (
                  <RightSidebarLoading />
                )}
              </div>
            )}
          />
        </Switch>
        {showPostRecommendation && <PostRecommendation isAuthFetching={isAuthFetching} />}
      </div>
    );
  }
}
