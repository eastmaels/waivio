import React from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import './EditorObject.less';

const EditorObject = ({ wObj }) => (
  <div className="editor-object">
    <div className="editor-object__content">
      <img className="editor-object__avatar" src={wObj.avatar} alt={wObj.tag} />
      <span className="editor-object__names">
        <span className="editor-object__names main">{`${wObj.tag} `}</span>
        {Boolean(wObj.names.length) && (
          <span className="editor-object__names other">
            ({wObj.names.reduce((acc, curr) => `${acc}${curr.value}, `, '').slice(0, -2)})
          </span>
        )}
      </span>
    </div>
    <div className="editor-object__controls">
      <div className="editor-object__controls delete">
        <i className="iconfont icon-trash editor-object__controls delete-icon" />
        <FormattedMessage id="remove" defaultMessage="Remove" />
      </div>
    </div>
  </div>
);

EditorObject.propTypes = {
  wObj: PropTypes.shape().isRequired,
};

export default EditorObject;
