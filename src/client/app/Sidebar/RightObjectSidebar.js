import React from 'react';
import PropTypes from 'prop-types';
import RightSidebarLoading from '../../../client/app/Sidebar/RightSidebarLoading';
import ObjectExpertise from '../../components/Sidebar/ObjectExpertise';
import ForecastBlock from '../../components/ForecastBlock';

const RightObjectSidebar = ({username, wobject, chartId}) =>
  wobject.users ? (
    <React.Fragment>
      <ObjectExpertise username={username} wobject={wobject}/>
      <ForecastBlock
        username={username}
        renderPlace={'rightObjectSidebar'}
        quoteSecurity={chartId.body}
      />
    </React.Fragment>
  ) : (
    <RightSidebarLoading />
  );

RightObjectSidebar.propTypes = {
  username: PropTypes.string.isRequired,
  wobject: PropTypes.shape().isRequired,
  chartId: PropTypes.shape().isRequired,
};

export default RightObjectSidebar;
