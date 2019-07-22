import React from "react";
import _ from "lodash";
import PropTypes from 'prop-types';
import {getFieldWithMaxWeight} from "../../object/wObjectHelper";
import {objectFields} from "../../../common/constants/listOfFields";
import ObjectAvatar from "../ObjectAvatar";
import './ObjectCard.less'


const ObjectCard = (props) => {
  const {object, name, type, parentElement} = props;
  const parentString = getFieldWithMaxWeight(object.parent, objectFields.name);
  const titleSrting = getFieldWithMaxWeight(object, objectFields.title);
  const description = getFieldWithMaxWeight(object, objectFields.description);
  return (
    <div className="object-card">
      {_.has(object, 'avatar') ?
        <img className="object-card__search-content-avatar" src={object.avatar} alt={object.title || ''}/> :
        <ObjectAvatar item={object} size={40}/>}
      <div className="object-card__search-content-info">
        <div className="object-card__search-content-name">
          {name}
        </div>
        <div
          className={`object-card__search-content-text${parentElement ? '-nav' : ''}`}>{parentString || titleSrting || description || ''}</div>
      </div>
      <div className="object-card__search-content-type">
        {type}
      </div>
    </div>
  )
};

ObjectCard.propTypes = {
  object: PropTypes.shape(),
  name: PropTypes.string,
  type: PropTypes.string,
  parentElement: PropTypes.string
};

ObjectCard.defaultProps = {
  object: {},
  name: '',
  type: '',
  parentElement: ''
};

export default ObjectCard;
