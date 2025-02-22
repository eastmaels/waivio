import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { Icon } from 'antd';

import Feed from '../feed/Feed';
import { getFeed, getIsAuthenticated, getObject } from '../reducers';
import {
  getFeedLoadingFromState,
  getFeedHasMoreFromState,
  getFeedFromState,
} from '../helpers/stateHelpers';
import { getObjectPosts, getMoreObjectPosts } from '../feed/feedActions';
import { showPostModal } from '../app/appActions';
import PostModal from '../post/PostModalContainer';
import IconButton from '../components/IconButton';
import './ObjectProfile.less';

@withRouter
@connect(
  state => ({
    feed: getFeed(state),
    object: getObject(state),
    isAuthenticated: getIsAuthenticated(state),
  }),
  {
    getObjectPosts,
    getMoreObjectPosts,
    showPostModal,
  },
)
export default class ObjectProfile extends React.Component {
  static propTypes = {
    feed: PropTypes.shape().isRequired,
    object: PropTypes.shape().isRequired,
    history: PropTypes.shape().isRequired,
    match: PropTypes.shape().isRequired,
    showPostModal: PropTypes.func.isRequired,
    limit: PropTypes.number,
    isAuthenticated: PropTypes.bool.isRequired,
    getObjectPosts: PropTypes.func,
    getMoreObjectPosts: PropTypes.func,
  };

  static defaultProps = {
    limit: 10,
    location: {},
    getObjectPosts: () => {},
    getMoreObjectPosts: () => {},
  };

  componentDidMount() {
    const { match, limit } = this.props;
    const { name } = match.params;

    this.props.getObjectPosts({
      object: name,
      username: name,
      limit,
    });
  }
  componentWillReceiveProps(nextProps) {
    const { match, limit } = this.props;
    if (match.params.name !== nextProps.match.params.name) {
      if (
        nextProps.feed &&
        nextProps.feed.objectPosts &&
        !nextProps.feed.objectPosts[nextProps.match.params.name]
      ) {
        this.props.getObjectPosts({
          object: nextProps.match.params.name,
          username: nextProps.match.params.name,
          limit,
        });
      }
      window.scrollTo(0, 0);
    }
  }

  handleCreatePost = () => {
    const { history, object } = this.props;
    history.push(`/editor?object=${object.author_permlink}`);
  };

  render() {
    const { feed, limit, isAuthenticated } = this.props;
    const wobjectname = this.props.match.params.name;
    const content = getFeedFromState('objectPosts', wobjectname, feed);
    const isFetching = getFeedLoadingFromState('objectPosts', wobjectname, feed);
    const hasMore = getFeedHasMoreFromState('objectPosts', wobjectname, feed);
    const loadMoreContentAction = () => {
      this.props.getMoreObjectPosts({
        username: wobjectname,
        authorPermlink: wobjectname,
        limit,
      });
    };

    return (
      <React.Fragment>
        <div className="object-profile">
          {isAuthenticated && (
            <div className="object-profile__row align-right">
              <IconButton
                icon={<Icon type="plus-circle" />}
                onClick={this.handleCreatePost}
                caption={
                  <FormattedMessage id="write_new_review" defaultMessage="Write new review" />
                }
              />
            </div>
          )}
          {!_.isEmpty(content) || isFetching ? (
            <Feed
              content={content}
              isFetching={isFetching}
              hasMore={hasMore}
              loadMoreContent={loadMoreContentAction}
              showPostModal={this.props.showPostModal}
            />
          ) : (
            <div className="object-profile__row align-center">
              <FormattedMessage
                id="empty_object_profile"
                defaultMessage="This object doesn't have any"
              />
            </div>
          )}
        </div>
        {<PostModal />}
      </React.Fragment>
    );
  }
}
