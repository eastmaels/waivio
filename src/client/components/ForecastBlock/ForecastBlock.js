import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {Icon} from 'antd';
import {injectIntl} from 'react-intl';
import './ForecastBlock.less';
import ForecastItem from '../ForecastItem/index';

@injectIntl
class ForecastBlock extends React.Component {
  static propTypes = {
    /* from decorators */
    intl: PropTypes.shape(),
    /* from connect */
    forecasts: PropTypes.arrayOf(PropTypes.shape({})),
    /* passed props */
    username: PropTypes.string,
    quoteSecurity: PropTypes.string,
    renderPlace: PropTypes.string,
    getActiveForecastsByObject: PropTypes.func.isRequired,
    getActiveForecastsByUser: PropTypes.func.isRequired
  };

  static defaultProps = {
    intl: {},
    forecasts: [],
    username: '',
    quoteSecurity: '',
    renderPlace: '',
    getActiveForecastsByUser: () => {
    },
    getActiveForecastsByObject: () => {
    },

  };

  componentDidMount() {
    const {quoteSecurity, getActiveForecastsByObject, getActiveForecastsByUser, username} = this.props;
    if (quoteSecurity) {
      getActiveForecastsByObject();
    }
    if (!quoteSecurity && username) {
      getActiveForecastsByUser();
    }
  }

  forecastBlock = (intl, forecasts) => (
    <div className="forecasts-block">
      <h4 className="forecasts-block__header">
        <Icon type="rise" className="forecasts-block__header-icon"/>
        <span>
          {intl.formatMessage({
            id: 'forecast.currentForecast',
            defaultMessage: 'Current forecasts',
          })}
        </span>
      </h4>
      <div className="forecasts-block__content">
        {forecasts.slice(0, 5).map(forecast => (
          <ForecastItem
            key={forecast.id}
            permlink={forecast.id}
            quoteSecurity={forecast.security}
            recommend={forecast.recommend}
            forecast={forecast.forecast}
            postPrice={forecast.postPrice}
            dateTimeCreate={forecast.created_at}
          />
        ))}
      </div>
    </div>
  );

  render() {
    const {forecasts, intl, renderPlace, quoteSecurity} = this.props;
    if (renderPlace === 'rightObjectSidebar' && !_.isEmpty(quoteSecurity) && forecasts && forecasts.length) {
      return this.forecastBlock(intl, forecasts);
    }
    if (renderPlace === 'rightSidebar' && forecasts && forecasts.length) {
      return this.forecastBlock(intl, forecasts);
    }
    return null;
  }
}

export default ForecastBlock;
