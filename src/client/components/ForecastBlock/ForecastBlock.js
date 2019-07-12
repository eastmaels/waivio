import React from 'react';
import PropTypes from 'prop-types';
import {Icon} from 'antd';
import {injectIntl} from 'react-intl';
import './ForecastBlock.less';
import ForecastItem from '../ForecastItem/index';

@injectIntl
class ForecastBlock extends React.Component {
  static propTypes = {
    forecastsByObject: PropTypes.arrayOf(PropTypes.shape({})),
    forecastsByUser: PropTypes.arrayOf(PropTypes.shape({})),
    getActiveForecasts: PropTypes.func.isRequired,
    intl: PropTypes.shape(),
    isChartObject: PropTypes.bool,
    renderPlace: PropTypes.string,
  };

  static defaultProps = {
    getActiveForecasts: () => {
    },
    intl: {},
    object: {},
    forecastsByObject: [],
    forecastsByUser: [],
    isChartObject: false,
    renderPlace: '',
  };

  componentDidMount() {
    this.props.getActiveForecasts();
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
    const {
      forecastsByObject,
      forecastsByUser,
      intl,
      renderPlace,
      object,
    } = this.props;
    if (renderPlace === 'rightObjectSidebar') {
      const currencies =
        (object && object.object_type && object.object_type === 'currencies') || 'crypto';
      return currencies && forecastsByObject && forecastsByObject.length
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
