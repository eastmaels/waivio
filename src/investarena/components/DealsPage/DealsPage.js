import _ from 'lodash';
import React, { Component } from 'react';
import { injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { getViewMode, setViewMode } from '../../helpers/localStorageHelpers';
import { arrayOfLogos } from '../../constants/arrayOfQuoteLogos';
// import ButtonBroker from '../Header/ButtonBroker';
import DealsTab from './DealsTab';
import './DealsPage.less';

const propTypes = {
  quotes: PropTypes.object.isRequired,
  quoteSettings: PropTypes.object.isRequired,
  intl: PropTypes.shape().isRequired,
  platformName: PropTypes.string.isRequired,
  platformConnect: PropTypes.bool.isRequired,
  viewMode: PropTypes.oneOf(['list', 'cards']),
};

class DealsPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      updatedQuoteSettings: {},
      viewMode: 'list',
    };
  }

  componentDidMount() {
    const currentViewMode = getViewMode('instruments');
    if (currentViewMode) {
      this.setState({ viewMode: currentViewMode });
    }
  }

  componentDidUpdate() {
    if (
      _.size(this.state.updatedQuoteSettings) === 0 &&
      this.props.quotes &&
      this.props.quoteSettings &&
      _.size(this.props.quotes) > 0 &&
      _.size(this.props.quoteSettings) > 0
    ) {
      this.setState({ updatedQuoteSettings: this.getOptions() });
    }
  }

  getOptions = () => {
    let resArray = [];
    const self = this;
    _.each(this.props.quotes, quote => {
      if (self.props.quoteSettings[quote.security]) {
        resArray.push({
          id: quote.security,
          name: self.props.quoteSettings[quote.security].name,
          image_small: arrayOfLogos.includes(quote.security)
            ? `/static/images/logoQuotes/${quote.security}.png`
            : `/static/images/logoQuotes/FX.png`,
          market: self.props.quoteSettings[quote.security].market,
        });
      }
    });
    return resArray;
  };
  toggleViewMode = () => {
    const viewModeValue = this.state.viewMode === 'list' ? 'cards' : 'list';
    this.setState({ viewMode: viewModeValue });
    setViewMode('instruments', viewModeValue);
  };
  render() {
    return (
      <div className="st-deals-page container">
        <div className="st-instruments-details">
          {this.props.platformName !== 'widgets' ? (
            <React.Fragment>
            <DealsTab viewMode={this.state.viewMode} />
            <div role="presentation" className="st-deals-toggle-view" onClick={this.toggleViewMode}>
              {this.state.viewMode === 'list' ?
                <img alt='card' className="st-deals-toggle-view__icon" src="/images/icons/grid-view.svg" />
                 :
                <img alt='list' className="st-deals-toggle-view__icon" src="/images/icons/list-of-items.svg" />
              }
            </div>
            </React.Fragment>
          ) : (
            <div className="st-deals-wrap st-connect-to-broker-wrap">
              <span className="st-margin-bottom-large">
                {this.props.intl.formatMessage({
                  id: 'headerAuthorized.textAttention3',
                  defaultMessage: 'To start trading, connect your broker.',
                })}
              </span>
              {/*<ButtonBroker />*/}
            </div>
          )}
        </div>
      </div>
    );
  }
}

DealsPage.propTypes = propTypes;

export default injectIntl(DealsPage);