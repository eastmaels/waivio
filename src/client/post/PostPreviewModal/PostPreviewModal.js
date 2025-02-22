import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { Button, Modal } from 'antd';
import { throttle } from 'lodash';
import BodyContainer from '../../containers/Story/BodyContainer';
import TagsSelector from '../../components/TagsSelector/TagsSelector';
import PolicyConfirmation from '../../components/PolicyConfirmation/PolicyConfirmation';
import AdvanceSettings from './AdvanceSettings';
import { isContentValid, splitPostContent } from '../../helpers/postHelpers';
import { handleWeightChange, setObjPercents } from '../../helpers/wObjInfluenceHelper';
import { rewardsValues } from '../../../common/constants/rewards';
import BBackTop from '../../components/BBackTop';
import './PostPreviewModal.less';

const isTopicValid = topic => /^[a-z0-9]+(-[a-z0-9]+)*$/.test(topic);

@injectIntl
class PostPreviewModal extends Component {
  static propTypes = {
    intl: PropTypes.shape(),
    isPublishing: PropTypes.bool,
    settings: PropTypes.shape({
      reward: PropTypes.oneOf([rewardsValues.none, rewardsValues.half, rewardsValues.all]),
      beneficiary: PropTypes.bool,
      upvote: PropTypes.bool,
    }).isRequired,
    content: PropTypes.string.isRequired,
    topics: PropTypes.arrayOf(PropTypes.string).isRequired,
    linkedObjects: PropTypes.arrayOf(PropTypes.shape()),
    isUpdating: PropTypes.bool,
    objPercentage: PropTypes.shape(),
    onTopicsChange: PropTypes.func.isRequired,
    onSettingsChange: PropTypes.func.isRequired,
    onPercentChange: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onUpdate: PropTypes.func.isRequired,
  };
  static defaultProps = {
    intl: {},
    isPublishing: false,
    linkedObjects: [],
    objPercentage: {},
    isUpdating: false,
  };

  static findScrollElement() {
    return document.querySelector('.post-preview-modal');
  }

  constructor(props) {
    super(props);

    this.state = {
      isModalOpen: false,
      title: '',
      body: '',
      objPercentage: setObjPercents(props.linkedObjects, props.objPercentage),
      weightBuffer: 0,
      isConfirmed: false,
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      nextState.isModalOpen ||
      this.state.isModalOpen ||
      isContentValid(this.props.content) !== isContentValid(nextProps.content)
    );
  }

  onUpdate = () => {
    throttle(this.throttledUpdate, 200, { leading: false, trailing: true })();
  };

  throttledUpdate = () => {
    const { body, title, linkedObjects } = this.state;
    const { topics, settings } = this.props;
    const postData = {
      body,
      title,
      topics,
      linkedObjects,
      ...settings,
    };
    this.props.onUpdate(postData);
  };

  showModal = () => {
    const { postTitle, postBody } = splitPostContent(this.props.content);
    const objPercentage = setObjPercents(this.props.linkedObjects, this.props.objPercentage);
    this.setState({
      isModalOpen: true,
      title: postTitle,
      body: postBody,
      weightBuffer: 0,
      objPercentage,
    });
  };

  hideModal = () => {
    if (!this.props.isPublishing) {
      this.setState({ isModalOpen: false });
    }
  };

  handleConfirmedChange = isConfirmed => this.setState({ isConfirmed });

  handleSettingsChange = updatedValue => this.props.onSettingsChange(updatedValue);

  handleTopicsChange = topics => this.props.onTopicsChange(topics);

  handlePercentChange = (objId, percent) => {
    const { objPercentage, weightBuffer } = this.state;
    const nextState = handleWeightChange(objPercentage, objId, percent, weightBuffer);
    this.setState(nextState);
    if (weightBuffer === 0) this.props.onPercentChange(nextState.objPercentage);
  };

  handleSubmit = () => this.props.onSubmit();

  render() {
    const { isModalOpen, isConfirmed, body, title, weightBuffer, objPercentage } = this.state;
    const { intl, isPublishing, content, topics, linkedObjects, settings, isUpdating } = this.props;
    return (
      <React.Fragment>
        {isModalOpen && (
          <Modal
            title={intl.formatMessage({ id: 'preview', defaultMessage: 'Preview' })}
            style={{ top: 0 }}
            visible={isModalOpen}
            centered={false}
            closable
            confirmLoading={false}
            wrapClassName={`post-preview-modal${isPublishing ? ' publishing' : ''}`}
            width={800}
            footer={null}
            onCancel={this.hideModal}
            zIndex={1500}
            maskClosable={false}
          >
            <BBackTop isModal target={PostPreviewModal.findScrollElement} />
            <h1 className="StoryFull__title preview">{title}</h1>
            <BodyContainer full body={body} />
            <TagsSelector
              className="post-preview-topics"
              disabled={isPublishing}
              label={intl.formatMessage({
                id: 'topics',
                defaultMessage: 'Topics',
              })}
              placeholder={intl.formatMessage({
                id: 'topics_placeholder',
                defaultMessage: 'Add story topics here',
              })}
              tags={topics}
              validator={isTopicValid}
              onChange={this.handleTopicsChange}
            />
            <PolicyConfirmation
              className="post-preview-legal-notice"
              isChecked={isConfirmed}
              disabled={isPublishing}
              checkboxLabel="Legal notice"
              policyText="Lorem ipsum dolor sit amet, enim in ut adipiscing turpis, mi interdum faucibus eleifend montes, augue viverra commodo vel placerat. Neque vitae amet consequat, proin sociis in sem, nunc fusce a facilisi per, sed sit et eget. A morbi velit proin, elit ac integer in justo, enim quis arcu arcu, magna dapibus est etiam. Nisl dapibus ut leo semper, pellentesque nec sem nec nulla, convallis dictum odio porttitor."
              onChange={this.handleConfirmedChange}
            />
            {!isUpdating && (
              <AdvanceSettings
                linkedObjects={linkedObjects}
                objPercentage={objPercentage}
                weightBuffer={weightBuffer}
                settings={settings}
                onSettingsChange={this.handleSettingsChange}
                onPercentChange={this.handlePercentChange}
              />
            )}
            <div className="edit-post-controls">
              <Button
                htmlType="submit"
                onClick={this.handleSubmit}
                loading={isPublishing}
                size="large"
                disabled={!isConfirmed}
                className="edit-post__submit-btn"
              >
                {intl.formatMessage({ id: 'publish', defaultMessage: 'Publish' })}
              </Button>
            </div>
          </Modal>
        )}
        <div className="edit-post-controls">
          <Button
            htmlType="button"
            disabled={!content || !isContentValid(content)}
            onClick={this.showModal}
            size="large"
            className="edit-post-controls__publish-ready-btn"
          >
            {intl.formatMessage({ id: 'ready_to_publish', defaultMessage: 'Ready to publish' })}
          </Button>
        </div>
      </React.Fragment>
    );
  }
}

export default PostPreviewModal;
