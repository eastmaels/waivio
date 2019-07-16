import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {Icon} from 'antd';
import {injectIntl} from 'react-intl';
import {withRouter} from 'react-router-dom';
import './ForecastBlock.less';
import ForecastItem from '../ForecastItem/index';

@withRouter
@injectIntl
class ForecastBlock extends React.Component {
  static propTypes = {
    quoteSecurity: PropTypes.string,
    intl: PropTypes.shape(),
    forecastsByObject: PropTypes.arrayOf(PropTypes.shape({})),
    forecastsByUser: PropTypes.arrayOf(PropTypes.shape({})),
    renderPlace: PropTypes.string,
    getActiveForecastsByObject: PropTypes.func.isRequired,
  };

  static defaultProps = {
    getActiveForecastsByObject: () => {
    },
    quoteSecurity: '',
    intl: {},
    forecastsByObject: [],
    forecastsByUser: [],
    renderPlace: '',
  };

  componentDidMount() {
    const {quoteSecurity, getActiveForecastsByObject} = this.props;
    if (quoteSecurity) {
      getActiveForecastsByObject();
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
    const {forecastsByObject, forecastsByUser, intl, renderPlace, quoteSecurity} = this.props;
    console.log('TEST OBJ', this.props);
    if (renderPlace === 'rightObjectSidebar') {
      return !_.isEmpty(quoteSecurity) && forecastsByObject && forecastsByObject.length
        ? this.forecastBlock(intl, forecastsByObject)
        : null;
    } else if (renderPlace === 'rightSidebar') {
      return forecastsByUser && forecastsByUser.length
        ? this.forecastBlock(intl, forecastsByUser)
        : null;
    }
    return null;
  }
}

export default ForecastBlock;
