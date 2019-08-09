import { Checkbox } from 'antd';
import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import './ObjectTypeFiltersPanel.less';

const ObjectTypeFiltersPanel = ({ activefilters, setFilterValue, intl }) => {
  const filterLayout = (filterName, key, checked) => (
    <div key={`${key}-${filterName}`} className="ObjectTypeFiltersPanel__item-wrap">
      <Checkbox onChange={() => setFilterValue(filterName, key)} checked={checked} />
      <div className="ObjectTypeFiltersPanel__name">{filterName}</div>
    </div>
  );

  return (
    <div className="ObjectTypeFiltersPanel">
      <div className="ObjectTypeFiltersPanel__container">
        <div className="ObjectTypeFiltersPanel__title">
          <i className="iconfont icon-trysearchlist SidebarContentBlock__icon" />
          <FormattedMessage id="filter" defaultMessage="Filter" />
        </div>
        {filterLayout('map', 'map', _.includes(activefilters.map, 'map'))}
        <div className="ObjectTypeFiltersPanel__title-text">
          {`${intl.formatMessage({
            id: 'rewards_for',
            defaultMessage: `Top rated`,
          })}:`}
        </div>
        {filterLayout(
          'Presentation',
          'Presentation',
          _.includes(activefilters.presentation, 'presentation'),
        )}
        {filterLayout('Taste', 'Taste', _.includes(activefilters.taste, 'Taste'))}
        {filterLayout('Value', 'Value', _.includes(activefilters.value, 'Value'))}
      </div>
      <div>--- another filters(soon) ---</div>
      {/* <div className="ObjectTypeFiltersPanel__container"> */}
      {/* <div className="ObjectTypeFiltersPanel__title"> */}
      {/* {intl.formatMessage({ */}
      {/* id: 'topRated', */}
      {/* defaultMessage: 'Top rated', */}
      {/* })} */}
      {/* </div> */}
      {/* {_.map(filters.ratings, item => */}
      {/* filterLayout(item, 'ratings', _.includes(activefilters.ratings, item)), */}
      {/* )} */}
      {/* </div> */}
      {/* <div className="ObjectTypeFiltersPanel__container"> */}
      {/* <div className="ObjectTypeFiltersPanel__title"> */}
      {/* {intl.formatMessage({ */}
      {/* id: 'tags', */}
      {/* defaultMessage: 'Tags', */}
      {/* })} */}
      {/* </div> */}
      {/* {_.map(filters.tagCloud, item => */}
      {/* filterLayout(item, 'tagCloud', _.includes(activefilters.tagCloud, item)), */}
      {/* )} */}
      {/* </div> */}
    </div>
  );
};

ObjectTypeFiltersPanel.propTypes = {
  // filters: PropTypes.shape(),
  activefilters: PropTypes.shape(),
  setFilterValue: PropTypes.func.isRequired,
  intl: PropTypes.shape(),
  // intl: PropTypes.shape().isRequired,
};

ObjectTypeFiltersPanel.defaultProps = {
  filters: {},
  activefilters: { map: true },
  intl: {},
};

export default injectIntl(ObjectTypeFiltersPanel);
