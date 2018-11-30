import { Button, Form } from 'reactstrap';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { injectIntl } from 'react-intl';
import Select from 'react-select';
import LoadingSpinner from '../../LoadingSpinner';
import ModalBrokerForgotPassword from '../ModalBrokerForgotPassword';
import { optionsPlatform } from '../../../constants/selectData';
import {validateRegexWithTooltip} from '../../../validate/validate';
import {validateRegistrationSignIn} from '../../../constants/constansValidate';

const propTypes = {
    isLoading: PropTypes.bool.isRequired,
    forgotPassBroker: PropTypes.func.isRequired,
    getBroker: PropTypes.func.isRequired,
    getBrokers: PropTypes.func.isRequired,
    authorizeBroker: PropTypes.func.isRequired,
    disconnectBroker: PropTypes.func.isRequired,
    brokerConnected: PropTypes.bool.isRequired,
    intl: PropTypes.object.isRequired
};

class BrokerAuthorization extends Component {
    constructor (props) {
        super(props);
        this.state = {
            selectedPlatform: 'umarkets',
            selectedBroker: null,
            email: '',
            passwordBroker: '',
            isDisabled: false,
            showDefaultBrokers: true,
            isPlatformSelected: false,
            showPassword: false,
            isModalForgotPassword: false
        };
    }
    componentDidMount () {
        this.inputs = {};
        this.inputs.loginInput = this.email;
        this.inputs.passwordInput = this.passwordInputRef;
        Object.keys(this.inputs).forEach((key) => {
            validateRegexWithTooltip(this.inputs[key], 'change', validateRegistrationSignIn[this.inputs[key].getAttribute('data-validate')]);
        });
        const value = localStorage.getItem('isOneClickTrade');
        this.checkboxOneClick.checked = (value === 'true');
    }
    getBroker = () => {
        return this.props.getBroker()
            .then((options) => {
                this.setState({
                    selectedBroker: options[0].value,
                    selectedPlatform: options[0].broker_options.broker_name,
                    selectedAccount: this.props.currentAccountName,
                    email: options[0].broker_options.email,
                    isDisabled: true
                });
                return { options, complete: true };
            });
    };
    getBrokers = () => {
        return this.props.getBrokers()
            .then(options => {
                if (options.length === 0) {
                    this.setState({showDefaultBrokers: false});
                }
                return { options, complete: true };
            });
    };
    handleBrokerChange = (event) => {
        this.setState({
            selectedBroker: event ? event.value : null,
            selectedPlatform: event ? event.broker_options.broker_name : null,
            email: event ? event.broker_options.email : '',
            isPlatformSelected: true
        });
        this.passwordInputRef.focus();
    };
    updateSelectedPlatform = (event) => {
        if (this.state.selectedPlatform !== event.value) {
            this.setState({selectedPlatform: event.value});
        }
    };
    handleInputChange = (event) => {
        const newState = {};
        newState[event.target.name] = event.target.value;
        this.setState(newState);
    };
    sendForm = (event) => {
        event.preventDefault();
        let isValid = true;
        Object.keys(this.inputs).forEach((key) => {
            if (this.inputs[key].value === '') {
                this.inputs[key].classList.add('st-input-danger');
                this.inputs[key].parentElement.setAttribute('data-tooltip', this.inputs[key].getAttribute('data-empty'));
                isValid = false;
            } else if (this.inputs[key].classList.contains('st-input-danger')) {
                isValid = false;
            }
        });
        if (isValid) {
            const data = {
                broker_name: this.state.selectedPlatform,
                email: this.state.email,
                password: this.state.password
            };
            this.props.authorizeBroker(data);
        }
    };
    toggleModalForgotPassword = () => {
        this.setState({isModalForgotPassword: !this.state.isModalForgotPassword});
    };
    disconnectBroker = (event) => {
        event.preventDefault();
        this.props.disconnectBroker();
    };
    handleOneClickTrading = () => {
        const value = localStorage.getItem('isOneClickTrade');
        localStorage.setItem('isOneClickTrade', !(value === 'true'));
    };
    showPassword = () => {
        this.setState({showPassword: !this.state.showPassword});
    };
    render () {
        const selectBroker = this.state.showDefaultBrokers
            ? <Select.Async
                className="st-broker-chose-broker"
                name="st-broker-select-broker"
                value={this.state.selectedBroker}
                placeholder={this.props.intl.formatMessage({ id: 'modalBroker.selectBroker' })}
                loadOptions={this.getBrokers}
                onChange={this.handleBrokerChange}
                clearable={ false }
                searchable={ false }
            />
            : null;
        const selectBrokerPresent =
            <Select.Async
                name="st-broker-select-broker"
                loadOptions={this.getBroker}
                value={this.state.selectedBroker}
                disabled={true}
            />;
        const buttonConnect =
            <Button
                className="st-broker-button"
                color="primary"
                onSubmit={this.sendForm}
                disabled={this.props.isLoading}
            >
                {this.props.intl.formatMessage({ id: 'modalBroker.connect' })}
            </Button>;
        const buttonDisconnect =
            <Button
                className="st-broker-button"
                color="danger"
                onSubmit={this.disconnectBroker}
                disabled={false}
            >
                {this.props.intl.formatMessage({ id: 'modalBroker.disconnect' })}
            </Button>;
        return (
            <div className="st-broker-authorization">
                { this.props.isLoading && <LoadingSpinner size="small"/> }
                <Form
                    onSubmit={this.props.brokerConnected ? this.disconnectBroker : this.sendForm}
                    className="st-broker-authorization-form"
                >
                    {this.state.showDefaultBrokers &&
                        <div className="st-broker-select-title">
                            {this.props.intl.formatMessage({ id: 'modalBroker.selectConnectionName' })}
                        </div>
                    }
                    {this.props.brokerConnected ? selectBrokerPresent : selectBroker }
                    <div className="st-broker-select-title">
                        {this.props.intl.formatMessage({ id: 'modalBroker.connectTo' })}
                    </div>
                    <div className="st-field-div" data-position="left">
                        <Select
                            name='selected-platform'
                            className="st-broker-select-platform"
                            options={optionsPlatform}
                            value={this.state.selectedPlatform}
                            onChange={this.updateSelectedPlatform}
                            disabled={this.state.isDisabled}
                            clearable={ false }
                            searchable={ false }
                            data-empty={this.props.intl.formatMessage({ id: 'tooltip.empty' })}
                        />
                    </div>
                    <div
                        className="st-field-div"
                        data-position="left"
                    >
                        <input
                            type="email"
                            name="email"
                            maxLength={256}
                            className="field broker-auth-email"
                            placeholder={this.props.intl.formatMessage({ id: 'authorizationForm.emailPlaceholder' })}
                            onChange={this.handleInputChange}
                            disabled={this.state.isDisabled}
                            value={this.state.email}
                            ref={(input) => this.email = input}
                            data-validate="email"
                            data-title={this.props.intl.formatMessage({ id: 'tooltip.emailValid' })}
                            data-empty={this.props.intl.formatMessage({ id: 'tooltip.empty' })}
                        />
                    </div>
                    <div
                        className="st-field-div"
                        data-position="left"
                    >
                        <input
                            type={this.state.showPassword ? 'text' : 'password'}
                            name="password"
                            maxLength={128}
                            className="field broker-auth-password"
                            placeholder={this.props.intl.formatMessage({ id: 'authorizationForm.passwordPlaceholder' })}
                            onChange={this.handleInputChange}
                            disabled={this.state.isDisabled}
                            ref={(input) => this.passwordInputRef = input}
                            value={this.state.password}
                            data-validate="passwordBroker"
                            data-title={this.props.intl.formatMessage({ id: 'tooltip.passwordBrokerValid' })}
                            data-empty={this.props.intl.formatMessage({ id: 'tooltip.empty' })}
                        />
                        <img
                            title={this.props.intl.formatMessage({ id: `${this.state.showPassword ? 'password.hidePasswords' : 'password.showPasswords'}` })}
                            className="st-eye-icon"
                            src={this.state.showPassword ? '/static/images/icons/eyeDark.svg' : '/static/images/icons/eye.svg'}
                            onClick={this.showPassword}
                        />
                    </div>
                    <div className="d-flex justify-content-between">
                        <span onClick={this.toggleModalForgotPassword} className="st-modal-broker-authorization-text-click">
                            {this.props.intl.formatMessage({id: 'modalBroker.forgotPassword'})}
                        </span>
                        <p className="d-flex">
                            {this.props.intl.formatMessage({ id: 'modalBroker.oneClickTrade' })}
                            <div className="checkbox-wrapper st-correct-wrapper">
                                <input
                                    type="checkbox"
                                    ref={(input) => this.checkboxOneClick = input}
                                    className="st-broker-checkbox"
                                    onChange={this.handleOneClickTrading}
                                />
                                <div id="oneClickTrade" className="checkbox">
                                    <img src="/static/images/icons/checkmark.svg"/>
                                </div>
                            </div>
                        </p>
                    </div>
                    { this.state.isModalForgotPassword &&
                        <ModalBrokerForgotPassword
                            isLoading={this.props.isLoading}
                            isOpen={this.state.isModalForgotPassword}
                            toggle={this.toggleModalForgotPassword}
                            forgotPassBroker={this.props.forgotPassBroker}
                        />
                    }
                    <div className="st-margin-bottom-middle">
                        <div className="st-broker-text">
                            {this.props.intl.formatMessage({ id: 'modalBroker.weNeverKeep' })}
                        </div>
                        <div className="st-broker-text">
                            {this.props.intl.formatMessage({ id: 'modalBroker.tradingAccounts' })}
                        </div>
                        <div className="st-broker-text">
                            {this.props.intl.formatMessage({ id: 'modalBroker.brokers' })}
                        </div>
                    </div>
                    { this.props.brokerConnected ? buttonDisconnect : buttonConnect }
                </Form>
            </div>
        );
    }
}

BrokerAuthorization.propTypes = propTypes;

export default injectIntl(BrokerAuthorization);
