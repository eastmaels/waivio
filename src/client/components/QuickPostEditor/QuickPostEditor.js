import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import Dropzone from 'react-dropzone';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import { Input } from 'antd';
import uuidv4 from 'uuid/v4';
import { injectIntl, FormattedMessage } from 'react-intl';
import { getAuthenticatedUser, getIsEditorLoading, getUpvoteSetting } from '../../reducers';
import { isValidImage, MAXIMUM_UPLOAD_SIZE } from '../../helpers/image';
import { WAIVIO_PARENT_PERMLINK } from '../../../common/constants/waivio';
import { notify } from '../../app/Notification/notificationActions';
import withEditor from '../Editor/withEditor';
import { createPost } from '../../post/Write/editorActions';
import Action from '../Button/Action';
import Avatar from '../Avatar';
import QuickPostEditorFooter from './QuickPostEditorFooter';
import './QuickPostEditor.less';

const version = require('../../../../package.json').version;

@withRouter
@injectIntl
@withEditor
@connect(
  state => ({
    user: getAuthenticatedUser(state),
    postCreationLoading: getIsEditorLoading(state),
    upvote: getUpvoteSetting(state),
  }),
  {
    notify,
    createPost,
  },
)
class QuickPostEditor extends React.Component {
  static propTypes = {
    postCreationLoading: PropTypes.bool.isRequired,
    user: PropTypes.shape().isRequired,
    intl: PropTypes.shape().isRequired,
    location: PropTypes.shape().isRequired,
    notify: PropTypes.func.isRequired,
    createPost: PropTypes.func.isRequired,
    onImageUpload: PropTypes.func,
    onImageInvalid: PropTypes.func,
    upvote: PropTypes.bool.isRequired,
  };

  static defaultProps = {
    onImageUpload: () => {},
    onImageInvalid: () => {},
  };

  state = {
    noContent: false,
    imageUploading: false,
    dropzoneActive: false,
    currentInputValue: '',
    currentImages: [],
    focusedInput: false,
    inputMinRows: 1,
  };

  setInput = input => {
    if (input) {
      this.originalInput = input;
      // eslint-disable-next-line react/no-find-dom-node
      this.input = ReactDOM.findDOMNode(input);
    }
  };

  setInputCursorPosition = pos => {
    if (this.input && this.input.setSelectionRange) {
      this.input.setSelectionRange(pos, pos);
    }
  };

  getQuickPostData = () => {
    const currentPaths = this.props.location.pathname.split('/');
    const appTag = WAIVIO_PARENT_PERMLINK;
    const tag = currentPaths[2];
    const tags = [];
    const images = _.map(this.state.currentImages, image => image.src);
    const postBody = _.reduce(
      this.state.currentImages,
      (str, image) => {
        const imageText = `![${image.name}](${image.src})\n`;
        return `${str}${imageText}`;
      },
      ' ',
    );
    const postTitle = this.state.currentInputValue;
    const data = {
      body: postBody,
      title: postTitle,
      reward: '50',
      author: this.props.user.name,
      parentAuthor: '',
      lastUpdated: Date.now(),
      upvote: this.props.upvote,
    };

    const metaData = {
      community: 'waiviodev',
      app: `waiviodev/${version}`,
      format: 'markdown',
    };

    if (images.length) {
      metaData.image = images;
    }

    if (!_.isEmpty(tag)) {
      tags.push(tag);
    } else {
      tags.push(appTag);
    }

    metaData.tags = tags;

    data.parentPermlink = _.isEmpty(tag) ? appTag : tag;
    data.permlink = _.kebabCase(postTitle);
    data.jsonMetadata = metaData;

    return data;
  };

  resizeTextArea = () => {
    if (this.originalInput) this.originalInput.resizeTextarea();
  };

  insertImage = (image, imageName = 'image') => {
    if (!this.input) return;
    const newImage = {
      src: image,
      name: imageName,
      id: uuidv4(),
    };
    this.setState({
      currentImages: _.concat(this.state.currentImages, newImage),
      focusedInput: true,
    });
  };

  handleDrop = files => {
    if (files.length === 0) {
      this.setState({
        dropzoneActive: false,
      });
      return;
    }

    this.setState({
      dropzoneActive: false,
      imageUploading: true,
    });
    let callbacksCount = 0;
    Array.from(files).forEach(item => {
      this.props.onImageUpload(
        item,
        (image, imageName) => {
          callbacksCount += 1;
          this.insertImage(image, imageName);
          if (callbacksCount === files.length) {
            this.setState({
              imageUploading: false,
            });
          }
        },
        () => {
          this.setState({
            imageUploading: false,
          });
        },
      );
    });
  };

  handleImageChange = e => {
    e.preventDefault();
    e.stopPropagation();

    if (e.target.files && e.target.files[0]) {
      if (!isValidImage(e.target.files[0])) {
        this.props.onImageInvalid();
        return;
      }

      this.setState({
        imageUploading: true,
      });
      this.props.onImageUpload(e.target.files[0], this.disableAndInsertImage, () =>
        this.setState({
          imageUploading: false,
        }),
      );
      // Input reacts on value change, so if user selects the same file nothing will happen.
      // We have to reset its value, so if same image is selected it will emit onChange event.
      e.target.value = '';
    }
  };

  handleDragEnter = () => this.setState({ dropzoneActive: true });

  handleDragLeave = () => this.setState({ dropzoneActive: false });

  handleFocusInput = () =>
    this.setState({ focusedInput: true, inputMinRows: 2 }, () => this.resizeTextArea());

  handleUnfocusInput = e => {
    const footerClassName = _.isElement(e.relatedTarget) ? e.relatedTarget.className : '';
    const clickedFooterContents =
      footerClassName === 'QuickPostEditor__footer' ||
      footerClassName === 'QuickPostEditor__footer__file';
    if (
      _.isEmpty(this.state.currentInputValue) &&
      _.isEmpty(this.state.currentImages) &&
      !clickedFooterContents
    ) {
      this.setState({ focusedInput: false, inputMinRows: 1 }, () => this.resizeTextArea());
    }
  };

  disableAndInsertImage = (image, imageName = 'image') => {
    this.setState({
      imageUploading: false,
    });
    this.insertImage(image, imageName);
  };

  handleCreatePost = () => {
    if (_.isEmpty(this.state.currentInputValue)) {
      this.props.notify(
        this.props.intl.formatMessage({
          id: 'quick_post_error_empty_title',
          defaultMessage: 'Post title cannot be empty.',
        }),
        'error',
      );
      return;
    }
    const data = this.getQuickPostData();
    this.props.createPost(data);
  };

  handleUpdateCurrentInputValue = e =>
    this.setState({
      currentInputValue: e.target.value,
    });

  handleRemoveImage = currentImage => {
    const imageIndex = _.findIndex(this.state.currentImages, image => image.id === currentImage.id);
    const currentImages = [...this.state.currentImages];
    currentImages.splice(imageIndex, 1);
    this.setState({ currentImages });
  };

  render() {
    const { imageUploading, focusedInput, currentImages, inputMinRows } = this.state;
    const { user, postCreationLoading, intl } = this.props;

    return (
      <div className="QuickPostEditor">
        <div className="QuickPostEditor__contents">
          <div className="QuickPostEditor__avatar">
            <Avatar username={user.name} size={40} />
          </div>
          <div className="QuickPostEditor__dropzone-base">
            <Dropzone
              disableClick
              style={{ flex: 1 }}
              accept="image/*"
              maxSize={MAXIMUM_UPLOAD_SIZE}
              onDropRejected={this.props.onImageInvalid}
              onDrop={this.handleDrop}
              onDragEnter={this.handleDragEnter}
              onDragLeave={this.handleDragLeave}
            >
              {this.state.dropzoneActive && (
                <div className="QuickPostEditor__dropzone">
                  <div>
                    <i className="iconfont icon-picture" />
                    <FormattedMessage id="drop_image" defaultMessage="Drop your images here" />
                  </div>
                </div>
              )}
              <Input.TextArea
                autosize={{ minRows: inputMinRows, maxRows: 12 }}
                onChange={this.handleUpdateCurrentInputValue}
                onFocus={this.handleFocusInput}
                onBlur={this.handleUnfocusInput}
                ref={ref => this.setInput(ref)}
                placeholder={intl.formatMessage({
                  id: 'write_quick_post',
                  defaultMessage: 'Write quick post',
                })}
                value={this.state.currentInputValue}
                maxLength="255"
              />
            </Dropzone>
          </div>
        </div>
        {focusedInput && (
          <QuickPostEditorFooter
            imageUploading={imageUploading}
            handleImageChange={this.handleImageChange}
            currentImages={currentImages}
            onRemoveImage={this.handleRemoveImage}
            handleFooterFocus={this.handleFocusInput}
          >
            <Action
              primary
              loading={postCreationLoading}
              disabled={postCreationLoading}
              onClick={this.handleCreatePost}
            >
              {postCreationLoading
                ? intl.formatMessage({
                    id: 'post_send_progress',
                    defaultMessage: 'Submitting',
                  })
                : intl.formatMessage({
                    id: 'post_send',
                    defaultMessage: 'Post',
                  })}
            </Action>
          </QuickPostEditorFooter>
        )}
      </div>
    );
  }
}

export default QuickPostEditor;
