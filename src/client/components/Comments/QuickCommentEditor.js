import React from 'react';
import PropTypes from 'prop-types';
import { Input, Icon } from 'antd';
import _ from 'lodash';
import withEditor from '../Editor/withEditor';
import Avatar from '../Avatar';
import './QuickCommentEditor.less';
import { isValidImage } from '../../helpers/image';

@withEditor
class QuickCommentEditor extends React.Component {
  static propTypes = {
    parentPost: PropTypes.shape().isRequired,
    username: PropTypes.string.isRequired,
    isLoading: PropTypes.bool,
    inputValue: PropTypes.string.isRequired,
    onImageUpload: PropTypes.func,
    onImageInvalid: PropTypes.func,
    onSubmit: PropTypes.func,
  };

  static defaultProps = {
    inputValue: '',
    isLoading: false,
    onImageUpload: () => {},
    onImageInvalid: () => {},
    onSubmit: () => {},
  };

  constructor(props) {
    super(props);

    this.state = {
      body: '',
      isDisabledSubmit: false,
      image: null,
      imageUploading: false,
      commentMsg: props.inputValue || '',
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleMsgChange = this.handleMsgChange.bind(this);
    this.handleRemoveImage = this.handleRemoveImage.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.shiftKey) {
      this.setState(prevState => ({ commentMsg: `${prevState.commentMsg}\n` }));
    } else {
      const { image, commentMsg } = this.state;
      this.setState({ isDisabledSubmit: true });
      if (commentMsg) {
        let message = commentMsg.trim();
        if (image) {
          message += `\n![${image.name}](${image.url})\n`;
        }
        this.props.onSubmit(this.props.parentPost, message).then(response => {
          if (!_.get(response, 'error', false)) {
            this.setState({ commentMsg: '', image: null });
          }
        });
      }
    }
  }

  handleMsgChange(e) {
    const commentMsg = e.currentTarget.value;
    this.setState({ commentMsg });
  }

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
      this.props.onImageUpload(
        e.target.files[0],
        (url, name) => this.setState({ image: { name, url }, imageUploading: false }),
        () => this.setState({ imageUploading: false }),
      );
      // Input reacts on value change, so if user selects the same file nothing will happen.
      // We have to reset its value, so if same image is selected it will emit onChange event.
      e.target.value = '';
    }
  };

  handleRemoveImage() {
    this.setState({ image: null, imageUploading: false });
  }

  render() {
    const { image, imageUploading, commentMsg } = this.state;
    const { username, isLoading } = this.props;

    const imageSelector = (
      <React.Fragment>
        <div className="QuickComment_inputfile">
          <input
            id={this.props.parentPost.id}
            type="file"
            accept="image/*"
            onInput={this.handleImageChange}
          />
        </div>
        <label htmlFor={this.props.parentPost.id}>
          {imageUploading ? (
            <Icon className="QuickComment__loading-img-icon" type="loading" />
          ) : (
            <i className="iconfont icon-picture QuickComment__add-img-icon" />
          )}
        </label>
      </React.Fragment>
    );

    return (
      <React.Fragment>
        <div className="QuickComment">
          {Boolean(username) && (
            <div className="QuickComment__avatar">
              <Avatar username={username} size={34} />
            </div>
          )}
          <Input.TextArea
            autosize
            value={commentMsg}
            disabled={imageUploading || isLoading}
            onPressEnter={this.handleSubmit}
            onChange={this.handleMsgChange}
          />
          {_.isEmpty(image) && imageSelector}
        </div>
        {Boolean(image) && (
          <div className="QuickComment__img-preview">
            <div
              className="QuickComment__img-preview__remove"
              onClick={this.handleRemoveImage}
              role="presentation"
            >
              <i className="iconfont icon-delete_fill QuickComment__img-preview__remove__icon" />
            </div>
            <img src={image.url} alt={image.name} />
          </div>
        )}
      </React.Fragment>
    );
  }
}

export default QuickCommentEditor;
