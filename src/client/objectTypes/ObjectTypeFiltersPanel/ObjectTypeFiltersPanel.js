import { Checkbox } from 'antd';
import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl } from 'react-intl';
import './ObjectTypeFiltersPanel.less';

const ObjectTypeFiltersPanel = ({ activefilters, setFilterValue }) => {
  const filterLayout = (filterName, key, checked) => (
    <div key={`${key}-${filterName}`} className="ObjectTypeFiltersPanel__item-wrap">
      <Checkbox onChange={() => setFilterValue(filterName, key)} checked={checked} />
      <div className="ObjectTypeFiltersPanel__name">{filterName}</div>
    </div>
  );

  return (
    <div className="ObjectTypeFiltersPanel">
      <div className="ObjectTypeFiltersPanel__container">
        {filterLayout('map', 'map', _.includes(activefilters.map, 'map'))}
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
  // intl: PropTypes.shape().isRequired,
};

ObjectTypeFiltersPanel.defaultProps = {
  filters: {},
  activefilters: { map: true },
};

export default injectIntl(ObjectTypeFiltersPanel);
