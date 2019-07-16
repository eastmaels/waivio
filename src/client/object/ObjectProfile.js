import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {FormattedMessage} from 'react-intl';
import {Icon} from 'antd';

import Feed from '../feed/Feed';
import {getFeed, getIsAuthenticated, getNightmode, getObject} from '../reducers';
import {getFeedFromState, getFeedHasMoreFromState, getFeedLoadingFromState,} from '../helpers/stateHelpers';
import {getMoreObjectPosts, getObjectPosts} from '../feed/feedActions';
import {showPostModal} from '../app/appActions';
import PostModal from '../post/PostModalContainer';
import IconButton from '../components/IconButton';
import './ObjectProfile.less';
import PostChart from '../../investarena/components/PostChart';
import {getIsLoadingPlatformState} from '../../investarena/redux/selectors/platformSelectors';
import {getDataCreatedAt, getDataForecast} from '../../investarena/helpers/diffDateTime';
import {supportedObjectTypes} from '../../investarena/constants/objectsInvestarena';
import PostQuotation from '../../investarena/components/PostQuotation/PostQuotation';
import {quoteIdForWidget} from '../../investarena/constants/constantsWidgets';

@withRouter
@connect(
  state => ({
    feed: getFeed(state),
    object: getObject(state),
    isAuthenticated: getIsAuthenticated(state),
    isLoadingPlatform: getIsLoadingPlatformState(state),
    isNightMode: getNightmode(state),
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
    isLoadingPlatform: PropTypes.bool,
    isNightMode: PropTypes.bool.isRequired,
    getObjectPosts: PropTypes.func,
    getMoreObjectPosts: PropTypes.func,
    chartId: PropTypes.shape(),
  };

  static defaultProps = {
    limit: 10,
    location: {},
    isLoadingPlatform: true,
    chartId: {},
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
    const {
      feed,
      limit,
      isLoadingPlatform,
      object,
      isNightMode,
      isAuthenticated,
      chartId,
    } = this.props;
    const wobjectname = this.props.match.params.name;
    const content = getFeedFromState('objectPosts', wobjectname, feed);
    const isFetching = getFeedLoadingFromState('objectPosts', wobjectname, feed);
    const hasMore = getFeedHasMoreFromState('objectPosts', wobjectname, feed);
    let createdAt = null;
    let forecast = null;
    const showChart =
      !isLoadingPlatform &&
      _.some(supportedObjectTypes, objectType => objectType === object.object_type);
    const loadMoreContentAction = () => {
      this.props.getMoreObjectPosts({
        username: wobjectname,
        authorPermlink: wobjectname,
        limit,
      });
    };
    if (showChart) {
      createdAt = getDataCreatedAt();
      forecast = getDataForecast();
    }
    return (
      <React.Fragment>
        <div className="object-profile">
          {showChart && chartId && chartId.body && (
            <div className="object-profile__trade">
              <PostChart
                quoteSecurity={chartId.body}
                createdAt={createdAt}
                forecast={forecast}
                recommend={'Buy'}
                toggleModalPost={() => {}}
                tpPrice={null}
                slPrice={null}
                expForecast={null}
                isObjectProfile
              />
              <PostQuotation quoteSecurity={chartId.body} />
              <iframe
                title="analysis"
                style={{
                  width: '100%',
                  height: '213px',
                  border: 'none',
                  overflow: 'hidden',
                  background: isNightMode ? '#24292e' : 'white',
                  padding: '10px 10px 0 10px',
                }}
                src={`//informer.maximarkets.org/widgetsws/AnalizeID.html?Period=60&typemode=${
                  isNightMode ? 'first' : 'second'
                }&font=OpenSans-Regular&css=${isNightMode ? 'darkGroup' : 'defaultGroup'}&rowsID=${
                  quoteIdForWidget[chartId.body]
                }&defaultId=190&time=global&lang=en`}
              />
            </div>
          )}
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
