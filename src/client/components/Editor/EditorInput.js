import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Icon, Input, Form } from 'antd';
import Dropzone from 'react-dropzone';
import { HotKeys } from 'react-hotkeys';
import { MAXIMUM_UPLOAD_SIZE, isValidImage } from '../../helpers/image';
import EditorToolbar from './EditorToolbar';
import './EditorInput.less';
import AddImageModal from './AddImageModal';

class EditorInput extends React.Component {
  static propTypes = {
    canCreateNewObject: PropTypes.bool,
    value: PropTypes.string, // eslint-disable-line react/require-default-props
    inputId: PropTypes.string,
    addon: PropTypes.node,
    placeholder: PropTypes.string,
    inputRef: PropTypes.func,
    onChange: PropTypes.func,
    onImageUpload: PropTypes.func,
    onImageInvalid: PropTypes.func,
    onAddLinkedObject: PropTypes.func,
    form: PropTypes.shape(),
    intl: PropTypes.shape(),
  };

  static defaultProps = {
    addon: null,
    canCreateNewObject: false,
    inputId: '',
    placeholder: '',
    inputRef: () => {},
    onChange: () => {},
    onImageUpload: () => {},
    onImageInvalid: () => {},
    onAddLinkedObject: () => {},
    form: {},
    intl: {},
  };

  static hotkeys = {
    h1: 'ctrl+shift+1',
    h2: 'ctrl+shift+2',
    h3: 'ctrl+shift+3',
    h4: 'ctrl+shift+4',
    h5: 'ctrl+shift+5',
    h6: 'ctrl+shift+6',
    bold: 'ctrl+b',
    italic: 'ctrl+i',
    quote: 'ctrl+q',
    link: 'ctrl+k',
    image: 'ctrl+m',
  };

  constructor(props) {
    super(props);

    this.state = {
      dropzoneActive: false,
      showModal: false,
    };

    this.setInput = this.setInput.bind(this);
    this.insertCode = this.insertCode.bind(this);
    this.handlePastedImage = this.handlePastedImage.bind(this);
    this.handleDrop = this.handleDrop.bind(this);
    this.handleDragEnter = this.handleDragEnter.bind(this);
    this.handleDragLeave = this.handleDragLeave.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSelectObject = this.handleSelectObject.bind(this);
  }

  componentDidMount() {
    if (this.input) {
      this.input.addEventListener('paste', this.handlePastedImage);
    }
  }

  setInput(input) {
    if (input) {
      this.originalInput = input;
      // eslint-disable-next-line react/no-find-dom-node
      this.input = ReactDOM.findDOMNode(input);
      this.props.inputRef(this.input);
    }
  }

  setValue(value, start, end) {
    this.props.onChange(value);
    if (start && end) {
      setTimeout(() => {
        this.input.setSelectionRange(start, end);
      }, 0);
    }
  }

  insertAtCursor(before, after, deltaStart = 0, deltaEnd = 0) {
    if (!this.input) return;

    const { value } = this.props;

    const startPos = this.input.selectionStart;
    const endPos = this.input.selectionEnd;
    const newValue =
      value.substring(0, startPos) +
      before +
      value.substring(startPos, endPos) +
      after +
      value.substring(endPos, value.length);

    this.setValue(newValue, startPos + deltaStart, endPos + deltaEnd);
  }

  insertImage(image, imageName = 'image') {
    if (!this.input) return;

    const { value } = this.props;

    const startPos = this.input.selectionStart;
    const endPos = this.input.selectionEnd;
    const imageText = `![${imageName}](${image})\n`;
    const newValue = `${value.substring(0, startPos)}${imageText}${value.substring(
      endPos,
      value.length,
    )}`;
    this.resizeTextarea();
    this.setValue(newValue, startPos + imageText.length, startPos + imageText.length);
  }

  insertObject(objId, displayName) {
    if (!this.input) return;

    const { value } = this.props;

    const startPos = this.input.selectionStart;
    const endPos = this.input.selectionEnd;
    const wObjText = `[${displayName}](${document.location.origin}/object/${objId})\n`;
    const newValue = `${value.substring(0, startPos)}${wObjText}${value.substring(
      endPos,
      value.length,
    )}`;
    this.resizeTextarea();
    this.setValue(newValue, startPos + wObjText.length, startPos + wObjText.length);
  }

  insertCode(type, params) {
    if (!this.input) return;
    this.input.focus();

    switch (type) {
      case 'h1':
        this.insertAtCursor('# ', '', 2, 2);
        break;
      case 'h2':
        this.insertAtCursor('## ', '', 3, 3);
        break;
      case 'h3':
        this.insertAtCursor('### ', '', 4, 4);
        break;
      case 'h4':
        this.insertAtCursor('#### ', '', 5, 5);
        break;
      case 'h5':
        this.insertAtCursor('##### ', '', 6, 6);
        break;
      case 'h6':
        this.insertAtCursor('###### ', '', 7, 7);
        break;
      case 'b':
        this.insertAtCursor('**', '**', 2, 2);
        break;
      case 'i':
        this.insertAtCursor('*', '*', 1, 1);
        break;
      case 'q':
        this.insertAtCursor('> ', '', 2, 2);
        break;
      case 'link':
        this.insertAtCursor(`[${params.title || ''}](${params.url || ''})`, ' ', 1, 1);
        break;
      case 'image':
        this.setState(prevState => ({ showModal: !prevState.showModal }));
        break;
      default:
        break;
    }

    this.resizeTextarea();
  }

  resizeTextarea() {
    if (this.originalInput) this.originalInput.resizeTextarea();
  }

  handlers = {
    h1: () => this.insertCode('h1'),
    h2: () => this.insertCode('h2'),
    h3: () => this.insertCode('h3'),
    h4: () => this.insertCode('h4'),
    h5: () => this.insertCode('h5'),
    h6: () => this.insertCode('h6'),
    bold: () => this.insertCode('b'),
    italic: () => this.insertCode('i'),
    quote: () => this.insertCode('q'),
    link: e => {
      e.preventDefault();
      this.insertCode('link');
    },
    image: () => this.insertCode('image'),
  };

  handlePastedImage(e) {
    if (e.clipboardData && e.clipboardData.items) {
      const items = e.clipboardData.items;
      Array.from(items).forEach(item => {
        if (item.kind === 'file') {
          e.preventDefault();

          const blob = item.getAsFile();

          if (!isValidImage(blob)) {
            this.props.onImageInvalid();
            return;
          }

          this.setState({
            imageUploading: true,
          });

          this.props.onImageUpload(blob, this.disableAndInsertImage, () =>
            this.setState({
              imageUploading: false,
            }),
          );
        }
      });
    }
  }

  handleDrop(files) {
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
  }

  handleDragEnter() {
    this.setState({ dropzoneActive: true });
  }

  handleDragLeave() {
    this.setState({ dropzoneActive: false });
  }

  handleChange(e) {
    const { value } = e.target;
    this.setValue(value);
  }

  handleSelectObject(wObj) {
    this.props.onAddLinkedObject(wObj);
    this.insertObject(wObj.id, wObj.name);
  }

  handleToggleModal = () => {
    this.setState(prevState => ({
      showModal: !prevState.showModal,
    }));
  };

  beforeInsertImage = (image, imageName) => {
    this.insertImage(image, imageName, this.input);
  };

  render() {
    const {
      addon,
      value,
      placeholder,
      canCreateNewObject,
      inputId,
      inputRef,
      onImageUpload,
      onImageInvalid,
      onAddLinkedObject,
      form,
      intl,
      ...restProps
    } = this.props;
    const { dropzoneActive, showModal } = this.state;

    return (
      <React.Fragment>
        <EditorToolbar
          canCreateNewObject={canCreateNewObject}
          onSelect={this.insertCode}
          onSelectLinkedObject={this.handleSelectObject}
          imageRef={this.imageRef}
        />
        <AddImageModal
          visible={showModal}
          onCancel={this.handleToggleModal}
          insertImage={this.beforeInsertImage}
          onImageUpload={onImageUpload}
          onImageInvalid={onImageInvalid}
        />
        <div className="EditorInput__dropzone-base">
          <Dropzone
            disableClick
            style={{}}
            accept="image/*"
            maxSize={MAXIMUM_UPLOAD_SIZE}
            onDropRejected={this.props.onImageInvalid}
            onDrop={this.handleDrop}
            onDragEnter={this.handleDragEnter}
            onDragLeave={this.handleDragLeave}
          >
            {dropzoneActive && (
              <div className="EditorInput__dropzone">
                <div>
                  <i className="iconfont icon-picture" />
                  <FormattedMessage id="drop_image" defaultMessage="Drop your images here" />
                </div>
              </div>
            )}
            <HotKeys keyMap={this.constructor.hotkeys} handlers={this.handlers}>
              <Input.TextArea
                {...restProps}
                placeholder={placeholder}
                onChange={this.handleChange}
                value={value}
                ref={this.setInput}
              />
            </HotKeys>
          </Dropzone>
        </div>
        <p className="EditorInput__imagebox">
          <input
            ref={input => {
              this.imageRef = input;
            }}
            type="file"
            id={this.props.inputId || 'inputfile'}
            accept="image/*"
            onChange={this.handleImageChange}
            onClick={e => {
              e.target.value = null;
            }}
          />
          <label htmlFor={this.props.inputId || 'inputfile'}>
            {this.state.imageUploading && (
              <React.Fragment>
                <Icon type="loading" />
                <FormattedMessage id="image_uploading" defaultMessage="Uploading your image..." />
              </React.Fragment>
            )}
          </label>
          <label htmlFor="reading_time" className="EditorInput__addon">
            {addon}
          </label>
        </p>
      </React.Fragment>
    );
  }
}

export default Form.create()(injectIntl(EditorInput));
