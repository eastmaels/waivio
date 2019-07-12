import {connect} from 'react-redux';
import React from 'react';
import ForecastBlock from './ForecastBlock';
import {getActiveForecasts} from '../../../investarena/redux/actions/forecastActions';
import {getForecastDataByQuote, getForecastDataByUser} from '../../reducers';
import {makeIsChartObject} from "../../../investarena/redux/selectors/forecastObjectSelector";

const ForecastBlockContainer = props => <ForecastBlock {...props} />;

const mapState = () => (state, ownProps) => ({
  forecastsByUser: getForecastDataByUser(state, ownProps.username),
  forecastsByObject: getForecastDataByQuote(state, state.object.wobject.default_name),
  object: state.object.wobject,
  isChartObject: makeIsChartObject(state)
});

function mapDispatchToProps(dispatch) {
  return {
    getActiveForecasts: () => dispatch(getActiveForecasts()),
  };
}

export default connect(
  mapState,
  mapDispatchToProps,
)(ForecastBlockContainer);
