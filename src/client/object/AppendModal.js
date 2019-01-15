import React from 'react';
import { Modal } from 'antd';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { withRouter } from 'react-router-dom';
import AppendForm from './AppendForm';

const AppendModal = ({ showModal, hideModal, locale, field, intl }) => (
  <Modal
    title={intl.formatMessage({
      id: 'suggestion_add_field',
      defaultMessage: 'Suggestion to add a field',
    })}
    footer={null}
    visible={showModal}
    onCancel={hideModal}
    width={767}
    destroyOnClose
  >
    <AppendForm hideModal={hideModal} currentLocale={locale} currentField={field} />
  </Modal>
);

AppendModal.propTypes = {
  showModal: PropTypes.bool.isRequired,
  hideModal: PropTypes.func.isRequired,
  field: PropTypes.string,
  locale: PropTypes.string,
  intl: PropTypes.shape().isRequired,
};

AppendModal.defaultProps = {
  showModal: false,
  field: 'auto',
  locale: 'en-US',
};

export default injectIntl(withRouter(AppendModal));
