import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import classNames from 'classnames';
import readingTime from 'reading-time';
import {
  injectIntl,
  FormattedMessage,
  FormattedRelative,
  FormattedDate,
  FormattedTime,
  FormattedNumber,
} from 'react-intl';
import { Link } from 'react-router-dom';
import { Collapse, Icon } from 'antd';
import Lightbox from 'react-image-lightbox';
import { getFromMetadata, extractImageTags } from '../../helpers/parser';
import { isPostDeleted, dropCategory } from '../../helpers/postHelpers';
import withAuthActions from '../../auth/withAuthActions';
import { getProxyImageURL } from '../../helpers/image';
import Popover from '../Popover';
import BTooltip from '../BTooltip';
import { getHtml } from './Body';
import BodyContainer from '../../containers/Story/BodyContainer';
import StoryDeleted from './StoryDeleted';
import StoryFooter from '../StoryFooter/StoryFooter';
import Avatar from '../Avatar';
import PopoverMenu, { PopoverMenuItem } from '../PopoverMenu/PopoverMenu';
import PostFeedEmbed from './PostFeedEmbed';
import PostedFrom from './PostedFrom';
import './StoryFull.less';
import ObjectCardView from '../../objectCard/ObjectCardView';
import { getClientWObj } from '../../adapters';
import WeightTag from '../WeightTag';

@injectIntl
@withAuthActions
class StoryFull extends React.Component {
  static propTypes = {
    intl: PropTypes.shape().isRequired,
    user: PropTypes.shape().isRequired,
    post: PropTypes.shape().isRequired,
    postState: PropTypes.shape().isRequired,
    rewardFund: PropTypes.shape().isRequired,
    defaultVotePercent: PropTypes.number.isRequired,
    onActionInitiated: PropTypes.func.isRequired,
    signature: PropTypes.string,
    pendingLike: PropTypes.bool,
    pendingFlag: PropTypes.bool,
    pendingFollow: PropTypes.bool,
    pendingBookmark: PropTypes.bool,
    commentCount: PropTypes.number,
    saving: PropTypes.bool,
    ownPost: PropTypes.bool,
    sliderMode: PropTypes.oneOf(['on', 'off', 'auto']),
    onFollowClick: PropTypes.func,
    onSaveClick: PropTypes.func,
    onReportClick: PropTypes.func,
    onLikeClick: PropTypes.func,
    onShareClick: PropTypes.func,
    onEditClick: PropTypes.func,
  };

  static defaultProps = {
    signature: null,
    pendingLike: false,
    pendingFlag: false,
    pendingFollow: false,
    pendingBookmark: false,
    commentCount: 0,
    saving: false,
    ownPost: false,
    sliderMode: 'auto',
    onFollowClick: () => {},
    onSaveClick: () => {},
    onReportClick: () => {},
    onLikeClick: () => {},
    onShareClick: () => {},
    onEditClick: () => {},
    postState: {},
  };

  constructor(props) {
    super(props);

    this.state = {
      lightbox: {
        open: false,
        index: 0,
      },
    };

    this.images = [];
    this.imagesAlts = [];

    this.handleClick = this.handleClick.bind(this);
    this.handleContentClick = this.handleContentClick.bind(this);
  }

  componentDidMount() {
    document.body.classList.add('white-bg');
  }

  componentWillUnmount() {
    const { post } = this.props;
    const hideWhiteBG = document && document.location.pathname !== dropCategory(post.url);
    if (hideWhiteBG) {
      document.body.classList.remove('white-bg');
    }
  }

  clickMenuItem(key) {
    const { post, postState } = this.props;

    switch (key) {
      case 'follow':
        this.props.onFollowClick(post);
        break;
      case 'save':
        this.props.onSaveClick(post);
        break;
      case 'report':
        this.props.onReportClick(post, postState);
        break;
      case 'edit':
        this.props.onEditClick(post);
        break;
      default:
    }
  }

  handleClick(key) {
    this.props.onActionInitiated(this.clickMenuItem.bind(this, key));
  }

  handleContentClick(e) {
    if (e.target.tagName === 'IMG' && this.images) {
      const tags = this.contentDiv.getElementsByTagName('img');
      for (let i = 0; i < tags.length; i += 1) {
        if (tags[i] === e.target && this.images.length > i) {
          if (e.target.parentNode && e.target.parentNode.tagName === 'A') return;
          this.setState({
            lightbox: {
              open: true,
              index: i,
            },
          });
        }
      }
    }
  }

  renderDtubeEmbedPlayer() {
    const { post } = this.props;
    const parsedJsonMetaData = _.attempt(JSON.parse, post.json_metadata);

    if (_.isError(parsedJsonMetaData)) {
      return null;
    }

    const video = getFromMetadata(post.json_metadata, 'video');
    const isDtubeVideo = _.has(video, 'content.videohash') && _.has(video, 'info.snaphash');

    if (isDtubeVideo) {
      const videoTitle = _.get(video, 'info.title', '');
      const author = _.get(video, 'info.author', '');
      const permlink = _.get(video, 'info.permlink', '');
      const dTubeEmbedUrl = `https://emb.d.tube/#!/${author}/${permlink}/true`;
      const dTubeIFrame = `<iframe width="100%" height="340" src="${dTubeEmbedUrl}" title="${videoTitle}" allowFullScreen></iframe>`;
      const embed = {
        type: 'video',
        provider_name: 'DTube',
        embed: dTubeIFrame,
        thumbnail: getProxyImageURL(`https://ipfs.io/ipfs/${video.info.snaphash}`, 'preview'),
      };
      return <PostFeedEmbed embed={embed} />;
    }

    return null;
  }

  render() {
    const {
      intl,
      user,
      post,
      postState,
      signature,
      pendingLike,
      pendingFlag,
      pendingFollow,
      pendingBookmark,
      commentCount,
      saving,
      rewardFund,
      ownPost,
      sliderMode,
      defaultVotePercent,
      onLikeClick,
      onShareClick,
      onEditClick,
    } = this.props;

    const taggedObjects = [];
    const linkedObjects = [];

    _.forEach(post.wobjects, wobj => {
      if (wobj.tagged) taggedObjects.push(wobj);
      else linkedObjects.push(wobj);
    });
    const { isReported } = postState;

    const { open, index } = this.state.lightbox;

    let signedBody = post.body;
    if (signature) {
      signedBody = `${post.body}<hr>${signature}`;
    }

    const parsedBody = getHtml(signedBody, {}, 'text');

    this.images = extractImageTags(parsedBody);

    let followText = '';

    if (postState.userFollowed && !pendingFollow) {
      followText = intl.formatMessage(
        { id: 'unfollow_username', defaultMessage: 'Unfollow {username}' },
        { username: post.author },
      );
    } else if (postState.userFollowed && pendingFollow) {
      followText = intl.formatMessage(
        { id: 'unfollow_username', defaultMessage: 'Unfollow {username}' },
        { username: post.author },
      );
    } else if (!postState.userFollowed && !pendingFollow) {
      followText = intl.formatMessage(
        { id: 'follow_username', defaultMessage: 'Follow {username}' },
        { username: post.author },
      );
    } else if (!postState.userFollowed && pendingFollow) {
      followText = intl.formatMessage(
        { id: 'follow_username', defaultMessage: 'Follow {username}' },
        { username: post.author },
      );
    }

    let replyUI = null;

    if (post.depth !== 0) {
      replyUI = (
        <div className="StoryFull__reply">
          <h3 className="StoryFull__reply__title">
            <FormattedMessage
              id="post_reply_title"
              defaultMessage="This is a reply to: {title}"
              values={{ title: post.root_title }}
            />
          </h3>
          <h4>
            <Link to={dropCategory(post.url)}>
              <FormattedMessage
                id="post_reply_show_original_post"
                defaultMessage="Show original post"
              />
            </Link>
          </h4>
          {post.depth > 1 && (
            <h4>
              <Link to={`/@${post.parent_author}/${post.parent_permlink}`}>
                <FormattedMessage
                  id="post_reply_show_parent_discussion"
                  defaultMessage="Show parent discussion"
                />
              </Link>
            </h4>
          )}
        </div>
      );
    }

    let popoverMenu = [];

    if (ownPost) {
      popoverMenu = [
        ...popoverMenu,
        <PopoverMenuItem key="edit">
          {saving ? <Icon type="loading" /> : <i className="iconfont icon-write" />}
          <FormattedMessage id="edit_post" defaultMessage="Edit post" />
        </PopoverMenuItem>,
      ];
    }

    if (!ownPost) {
      popoverMenu = [
        ...popoverMenu,
        <PopoverMenuItem key="follow" disabled={pendingFollow}>
          {pendingFollow ? <Icon type="loading" /> : <i className="iconfont icon-people" />}
          {followText}
        </PopoverMenuItem>,
      ];
    }

    popoverMenu = [
      ...popoverMenu,
      <PopoverMenuItem key="save">
        {pendingBookmark ? <Icon type="loading" /> : <i className="iconfont icon-collection" />}
        <FormattedMessage
          id={postState.isSaved ? 'unsave_post' : 'save_post'}
          defaultMessage={postState.isSaved ? 'Unsave post' : 'Save post'}
        />
      </PopoverMenuItem>,
      <PopoverMenuItem key="report">
        {pendingFlag ? (
          <Icon type="loading" />
        ) : (
          <i
            className={classNames('iconfont', {
              'icon-flag': !postState.isReported,
              'icon-flag_fill': postState.isReported,
            })}
          />
        )}
        {isReported ? (
          <FormattedMessage id="unflag_post" defaultMessage="Unflag post" />
        ) : (
          <FormattedMessage id="flag_post" defaultMessage="Flag post" />
        )}
      </PopoverMenuItem>,
    ];

    let content = null;
    if (isPostDeleted(post)) {
      content = <StoryDeleted />;
    } else {
      content = (
        <div
          role="presentation"
          ref={div => {
            this.contentDiv = div;
          }}
          onClick={this.handleContentClick}
        >
          {this.renderDtubeEmbedPlayer()}
          <BodyContainer full body={signedBody} json_metadata={post.json_metadata} />
        </div>
      );
    }

    return (
      <div className="StoryFull">
        {replyUI}
        <h1 className="StoryFull__title">{post.title}</h1>
        <h3 className="StoryFull__comments_title">
          <a href="#comments">
            {commentCount === 1 ? (
              <FormattedMessage
                id="comment_count"
                values={{ count: <FormattedNumber value={commentCount} /> }}
                defaultMessage="{count} comment"
              />
            ) : (
              <FormattedMessage
                id="comments_count"
                values={{ count: <FormattedNumber value={commentCount} /> }}
                defaultMessage="{count} comments"
              />
            )}
          </a>
        </h3>
        <div className="StoryFull__header">
          <Link to={`/@${post.author}`}>
            <Avatar username={post.author} size={60} />
          </Link>
          <div className="StoryFull__header__text">
            <Link to={`/@${post.author}`}>
              <span className="username">{post.author}</span>
              <WeightTag weight={post.author_wobjects_weight} rank={post.author_rank} />
            </Link>
            <BTooltip
              title={
                <span>
                  <FormattedDate value={`${post.created}Z`} />{' '}
                  <FormattedTime value={`${post.created}Z`} />
                </span>
              }
            >
              <span className="StoryFull__header__text__date">
                <FormattedRelative value={`${post.created}Z`} />
              </span>
            </BTooltip>
            <span className="StoryFull__posted_from">
              <PostedFrom post={post} />
            </span>
            {Math.ceil(readingTime(post.body).minutes) > 1 && (
              <span>
                <span className="StoryFull__bullet" />
                <BTooltip
                  title={
                    <span>
                      <FormattedMessage
                        id="words_tooltip"
                        defaultMessage={'{words} words'}
                        values={{ words: readingTime(post.body).words }}
                      />
                    </span>
                  }
                >
                  <span className="StoryFull__header__reading__time">
                    <FormattedMessage
                      id="reading_time_post"
                      defaultMessage={'{min} min read'}
                      values={{ min: Math.ceil(readingTime(post.body).minutes) }}
                    />
                  </span>
                </BTooltip>
              </span>
            )}
          </div>
          <Popover
            placement="bottomRight"
            trigger="click"
            content={
              <PopoverMenu onSelect={this.handleClick} bold={false}>
                {popoverMenu}
              </PopoverMenu>
            }
          >
            <i className="iconfont icon-more StoryFull__header__more" />
          </Popover>
        </div>
        <div className="StoryFull__content">{content}</div>
        {open && (
          <Lightbox
            imageTitle={this.images[index].alt}
            mainSrc={this.images[index].src}
            nextSrc={this.images[(index + 1) % this.images.length].src}
            prevSrc={this.images[(index + (this.images.length - 1)) % this.images.length].src}
            onCloseRequest={() => {
              this.setState({
                lightbox: {
                  ...this.state.lightbox,
                  open: false,
                },
              });
            }}
            onMovePrevRequest={() =>
              this.setState({
                lightbox: {
                  ...this.state.lightbox,
                  index: (index + (this.images.length - 1)) % this.images.length,
                },
              })
            }
            onMoveNextRequest={() =>
              this.setState({
                lightbox: {
                  ...this.state.lightbox,
                  index: (index + (this.images.length + 1)) % this.images.length,
                },
              })
            }
          />
        )}

        <Collapse defaultActiveKey={['1']} accordion>
          {!_.isEmpty(linkedObjects) && (
            <Collapse.Panel
              header={`${intl.formatMessage({
                id: 'linked_objects',
                defaultMessage: 'Linked objects',
              })} ${linkedObjects.length}`}
              key="1"
            >
              {_.map(linkedObjects, obj => {
                const wobj = getClientWObj(obj);
                return <ObjectCardView key={`${wobj.id}`} wObject={wobj} />;
              })}
            </Collapse.Panel>
          )}
          {!_.isEmpty(taggedObjects) && (
            <Collapse.Panel
              header={`${intl.formatMessage({
                id: 'objects_related_by_tags',
                defaultMessage: 'Objects related by #tags',
              })} ${taggedObjects.length}`}
              key="2"
            >
              {_.map(taggedObjects, obj => {
                const wobj = getClientWObj(obj);
                return <ObjectCardView key={`${wobj.id}`} wObject={wobj} />;
              })}
            </Collapse.Panel>
          )}
        </Collapse>

        <StoryFooter
          user={user}
          post={post}
          postState={postState}
          pendingLike={pendingLike}
          pendingFlag={pendingFlag}
          pendingFollow={pendingFollow}
          pendingBookmark={pendingBookmark}
          ownPost={ownPost}
          singlePostVew
          rewardFund={rewardFund}
          saving={saving}
          sliderMode={sliderMode}
          defaultVotePercent={defaultVotePercent}
          onLikeClick={onLikeClick}
          handlePostPopoverMenuClick={this.handleClick}
          onShareClick={onShareClick}
          onEditClick={onEditClick}
        />
      </div>
    );
  }
}

export default StoryFull;
