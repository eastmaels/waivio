import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';
// import { getLanguageState } from '../../../../redux/selectors/languageSelectors';
import { getModalIsOpenState } from '../../../../redux/selectors/modalsSelectors';
import TchChart from './TchChart';
import {getChartsState} from "../../../../redux/selectors/chartsSelectors";

const propTypes = {
    isOpen: PropTypes.bool.isRequired,
    language: PropTypes.string.isRequired,
    // chartData: PropTypes.array.isRequired
};

const TchChartContainer = (props) => <TchChart {...props}/>;

TchChartContainer.propTypes = propTypes;

function mapStateToProps (state) {
    return {
        language: 'en',
        // language: getLanguageState(state),
      // chartData: getChartsState(state),

      isOpen: getModalIsOpenState(state, 'modalPost')
    };
}

export default connect(mapStateToProps)(TchChartContainer);
