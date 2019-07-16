import {connect} from 'react-redux';
import React from 'react';
import ForecastBlock from './ForecastBlock';
import {getActiveForecasts} from '../../../investarena/redux/actions/forecastActions';
import {getForecastDataByQuote, getForecastDataByUser} from '../../reducers';

const ForecastBlockContainer = props => <ForecastBlock {...props} />;

const mapState = () => (state, ownProps) => ({
  forecastsByUser: getForecastDataByUser(state, ownProps.username),
  forecastsByObject: getForecastDataByQuote(state, state.object.wobject.default_name),
  object: state.object.wobject,
});

function mapDispatchToProps(dispatch, ownProps) {
  return {
    getActiveForecastsByUser: () => dispatch(getActiveForecasts(ownProps.username)),
    getActiveForecastsByObject: () => dispatch(getActiveForecasts('', ownProps.quoteSecurity)),
  };
}

export default connect(
  mapState,
  mapDispatchToProps,
)(ForecastBlockContainer);
