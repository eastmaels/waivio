import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {FormattedMessage, injectIntl} from 'react-intl';
import {Link, NavLink, withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import {AutoComplete, Button, Icon, Input, Menu, Modal} from 'antd';
import classNames from 'classnames';
import {searchAutoComplete} from '../../search/searchActions';
import {getUpdatedSCUserMetadata} from '../../auth/authActions';
import {
  getAuthenticatedUserSCMetaData,
  getAutoCompleteSearchResults,
  getIsLoadingNotifications,
  getNightmode,
  getNotifications,
  getScreenSize,
} from '../../reducers';
import ModalBroker from '../../../investarena/components/Modals/ModalBroker';
import ModalDealConfirmation from '../../../investarena/components/Modals/ModalDealConfirmation';
import SteemConnect from '../../steemConnectAPI';
import {PARSED_NOTIFICATIONS} from '../../../common/constants/notifications';
import BTooltip from '../BTooltip';
import Avatar from '../Avatar';
import PopoverMenu, {PopoverMenuItem} from '../PopoverMenu/PopoverMenu';
import Popover from '../Popover';
import Notifications from './Notifications/Notifications';
import LanguageSettings from './LanguageSettings';
import './Topnav.less';
import Balance from '../../../investarena/components/Header/Balance';
import {getIsLoadingPlatformState, getPlatformNameState,} from '../../../investarena/redux/selectors/platformSelectors';
import {toggleModal} from '../../../investarena/redux/actions/modalsActions';
import config from '../../../investarena/configApi/config';
import {getFieldWithMaxWeight} from '../../object/wObjectHelper';
import {objectFields} from '../../../common/constants/listOfFields';
import ModalSignUp from './ModalSignUp/ModalSignUp';
import ObjectCard from '../ObjectCard/ObjectCard';


@injectIntl
@withRouter
@connect(
  state => ({
    autoCompleteSearchResults: getAutoCompleteSearchResults(state),
    notifications: getNotifications(state),
    userSCMetaData: getAuthenticatedUserSCMetaData(state),
    loadingNotifications: getIsLoadingNotifications(state),
    screenSize: getScreenSize(state),
    isNightMode: getNightmode(state),
    platformName: getPlatformNameState(state),
    isLoadingPlatform: getIsLoadingPlatformState(state),
  }),
  {
    searchAutoComplete,
    getUpdatedSCUserMetadata,
    toggleModal,
  },
)
class Topnav extends React.Component {
  static get MENU_ITEMS() {
    return {
      HOME: 'home',
      MY_FEED: 'myFeed',
      MARKETS: 'markets',
      DEALS: 'deals',
      CLOSEDDEALS: 'closedDeals',
    };
  }

  static get ROUTES_MAP() {
    return {
      [this.MENU_ITEMS.HOME]: ['/'],
      [this.MENU_ITEMS.MY_FEED]: ['/my_feed'],
      [this.MENU_ITEMS.MARKETS]: ['/markets/'],
      [this.MENU_ITEMS.DEALS]: ['/deals/'],
    };
  }

  static propTypes = {
    autoCompleteSearchResults: PropTypes.oneOfType([
      PropTypes.shape(),
      PropTypes.arrayOf(PropTypes.shape()),
    ]),
    intl: PropTypes.shape().isRequired,
    location: PropTypes.shape().isRequired,
    history: PropTypes.shape().isRequired,
    username: PropTypes.string,
    platformName: PropTypes.string.isRequired,
    notifications: PropTypes.arrayOf(PropTypes.shape()),
    searchAutoComplete: PropTypes.func.isRequired,
    toggleModal: PropTypes.func.isRequired,
    getUpdatedSCUserMetadata: PropTypes.func.isRequired,
    screenSize: PropTypes.string.isRequired,
    onMenuItemClick: PropTypes.func,
    userSCMetaData: PropTypes.shape(),
    loadingNotifications: PropTypes.bool,
    isLoadingPlatform: PropTypes.bool.isRequired,
    isNightMode: PropTypes.bool.isRequired,
  };

  static defaultProps = {
    autoCompleteSearchResults: {},
    notifications: [],
    username: undefined,
    onMenuItemClick: () => {
    },
    userSCMetaData: {},
    loadingNotifications: false,
    screenSize: 'medium',
  };

  static handleScrollToTop() {
    if (window) {
      window.scrollTo(0, 0);
    }
  }

  constructor(props) {
    super(props);

    this.state = {
      searchBarActive: false,
      popoverVisible: false,
      searchBarValue: '',
      notificationsPopoverVisible: false,
      selectedPage: '',
    };
    this.handleMoreMenuSelect = this.handleMoreMenuSelect.bind(this);
    this.handleMoreMenuVisibleChange = this.handleMoreMenuVisibleChange.bind(this);
    this.handleNotificationsPopoverVisibleChange = this.handleNotificationsPopoverVisibleChange.bind(
      this,
    );
    this.handleCloseNotificationsPopover = this.handleCloseNotificationsPopover.bind(this);
    this.handleSelectOnAutoCompleteDropdown = this.handleSelectOnAutoCompleteDropdown.bind(this);
    this.handleAutoCompleteSearch = this.handleAutoCompleteSearch.bind(this);
    this.handleSearchForInput = this.handleSearchForInput.bind(this);
    this.handleOnChangeForAutoComplete = this.handleOnChangeForAutoComplete.bind(this);
    this.hideAutoCompleteDropdown = this.hideAutoCompleteDropdown.bind(this);
    this.setSelectedPage = this.setSelectedPage.bind(this);
    this.handleClickMenu = this.handleClickMenu.bind(this);
  }

  componentDidMount() {
    this.setSelectedPage();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.location.pathname !== this.props.location.pathname) {
      this.setSelectedPage();
    }
  }

  setSelectedPage() {
    const {
      location: {pathname},
      username,
    } = this.props;
    let currPage = Topnav.MENU_ITEMS.HOME;
    if ((pathname !== '/' && username) || (pathname !== '/my_feed' && !username)) {
      Object.keys(Topnav.ROUTES_MAP).forEach(key => {
        const routeList = Topnav.ROUTES_MAP[key];
        if (routeList.some(route => pathname.includes(`${route}`))) {
          currPage = key;
        }
      });
    }

    this.setState({selectedPage: currPage});
  }

  handleMoreMenuSelect(key) {
    this.setState({popoverVisible: false}, () => {
      this.props.onMenuItemClick(key);
    });
  }

  handleMoreMenuVisibleChange(visible) {
    this.setState({popoverVisible: visible});
  }

  handleNotificationsPopoverVisibleChange(visible) {
    if (visible) {
      this.setState({notificationsPopoverVisible: visible});
    } else {
      this.handleCloseNotificationsPopover();
    }
  }

  handleCloseNotificationsPopover() {
    this.setState({
      notificationsPopoverVisible: false,
    });
  }

  handleClickMenu = e => this.setState({selectedPage: e.key});

  menuForLoggedOut = () => {
    const {location} = this.props;
    const {searchBarActive} = this.state;
    const next = location.pathname.length > 1 ? location.pathname : '';

    return (
      <div
        className={classNames('Topnav__menu-container Topnav__menu-logged-out', {
          'Topnav__mobile-hidden': searchBarActive,
        })}
      >
        <Menu className="Topnav__menu-container__menu" mode="horizontal">
          <Menu.Item key="signup">
            <ModalSignUp isButton={false}/>
          </Menu.Item>
          <Menu.Item key="divider" disabled>
            |
          </Menu.Item>
          <Menu.Item key="login">
            <a href={SteemConnect.getLoginURL(next)}>
              <FormattedMessage id="login" defaultMessage="Log in"/>
            </a>
          </Menu.Item>
          <Menu.Item key="language">
            <LanguageSettings/>
          </Menu.Item>
        </Menu>
      </div>
    );
  };

  menuForLoggedIn = () => {
    const {intl, username, notifications, userSCMetaData, loadingNotifications} = this.props;
    const {searchBarActive, notificationsPopoverVisible, popoverVisible} = this.state;
    const lastSeenTimestamp = _.get(userSCMetaData, 'notifications_last_timestamp');
    const notificationsCount = _.isUndefined(lastSeenTimestamp)
      ? _.size(notifications)
      : _.size(
        _.filter(
          notifications,
          notification =>
            lastSeenTimestamp < notification.timestamp &&
            _.includes(PARSED_NOTIFICATIONS, notification.type),
        ),
      );
    const displayBadge = notificationsCount > 0;
    const notificationsCountDisplay = notificationsCount > 99 ? '99+' : notificationsCount;
    return (
      <div
        className={classNames('Topnav__menu-container', {
          'Topnav__mobile-hidden': searchBarActive,
        })}
      >
        <ModalBroker/>
        <Menu selectedKeys={[]} className="Topnav__menu-container__menu" mode="horizontal">
          <Menu.Item key="write">
            <BTooltip
              placement="bottom"
              title={intl.formatMessage({id: 'write_post', defaultMessage: 'Write post'})}
              mouseEnterDelay={1}
            >
              <Link to="/editor" className="Topnav__link Topnav__link--action">
                <i className="iconfont icon-write"/>
              </Link>
            </BTooltip>
          </Menu.Item>
          <Menu.Item key="notifications" className="Topnav__item--badge">
            <BTooltip
              placement="bottom"
              title={intl.formatMessage({id: 'notifications', defaultMessage: 'Notifications'})}
              overlayClassName="Topnav__notifications-tooltip"
              mouseEnterDelay={1}
            >
              <Popover
                placement="bottomRight"
                trigger="click"
                content={
                  <Notifications
                    notifications={notifications}
                    onNotificationClick={this.handleCloseNotificationsPopover}
                    st-card__chart
                    currentAuthUsername={username}
                    lastSeenTimestamp={lastSeenTimestamp}
                    loadingNotifications={loadingNotifications}
                    getUpdatedSCUserMetadata={this.props.getUpdatedSCUserMetadata}
                  />
                }
                visible={notificationsPopoverVisible}
                onVisibleChange={this.handleNotificationsPopoverVisibleChange}
                overlayClassName="Notifications__popover-overlay"
                title={intl.formatMessage({id: 'notifications', defaultMessage: 'Notifications'})}
              >
                <a className="Topnav__link Topnav__link--light Topnav__link--action">
                  {displayBadge ? (
                    <div className="Topnav__notifications-count">{notificationsCountDisplay}</div>
                  ) : (
                    <i className="iconfont icon-remind"/>
                  )}
                </a>
              </Popover>
            </BTooltip>
          </Menu.Item>
          <Menu.Item key="user" className="Topnav__item-user">
            <Link className="Topnav__user" to={`/@${username}`} onClick={Topnav.handleScrollToTop}>
              <Avatar username={username} size={36}/>
            </Link>
          </Menu.Item>
          <Menu.Item key="more" className="Topnav__menu--icon">
            <Popover
              placement="bottom"
              trigger="click"
              visible={popoverVisible}
              onVisibleChange={this.handleMoreMenuVisibleChange}
              overlayStyle={{position: 'fixed'}}
              content={
                <PopoverMenu onSelect={this.handleMoreMenuSelect}>
                  <PopoverMenuItem key="my-profile" fullScreenHidden>
                    <FormattedMessage id="my_profile" defaultMessage="My profile"/>
                  </PopoverMenuItem>
                  <PopoverMenuItem key="feed" fullScreenHidden>
                    <FormattedMessage id="feed" defaultMessage="Feed"/>
                  </PopoverMenuItem>
                  <PopoverMenuItem key="news" fullScreenHidden>
                    <FormattedMessage id="news" defaultMessage="News"/>
                  </PopoverMenuItem>
                  <PopoverMenuItem key="objects" fullScreenHidden>
                    <FormattedMessage id="objects" defaultMessage="Objects"/>
                  </PopoverMenuItem>
                  <PopoverMenuItem key="replies" fullScreenHidden>
                    <FormattedMessage id="replies" defaultMessage="Replies"/>
                  </PopoverMenuItem>
                  <PopoverMenuItem key="wallet" fullScreenHidden>
                    <FormattedMessage id="wallet" defaultMessage="Wallet"/>
                  </PopoverMenuItem>
                  <PopoverMenuItem key="activity">
                    <FormattedMessage id="activity" defaultMessage="Activity"/>
                  </PopoverMenuItem>
                  <PopoverMenuItem key="bookmarks">
                    <FormattedMessage id="bookmarks" defaultMessage="Bookmarks"/>
                  </PopoverMenuItem>
                  <PopoverMenuItem key="drafts">
                    <FormattedMessage id="drafts" defaultMessage="Drafts"/>
                  </PopoverMenuItem>
                  <PopoverMenuItem key="settings">
                    <FormattedMessage id="settings" defaultMessage="Settings"/>
                  </PopoverMenuItem>
                  <PopoverMenuItem key="logout">
                    <FormattedMessage id="logout" defaultMessage="Logout"/>
                  </PopoverMenuItem>
                </PopoverMenu>
              }
            >
              <a className="Topnav__link">
                <Icon type="caret-down"/>
                <Icon type="bars"/>
              </a>
            </Popover>
          </Menu.Item>
        </Menu>
      </div>
    );
  };

  content = () => (this.props.username ? this.menuForLoggedIn() : this.menuForLoggedOut());

  handleMobileSearchButtonClick = () => {
    const {searchBarActive} = this.state;
    this.setState({searchBarActive: !searchBarActive}, () => {
      this.searchInputRef.input.focus();
    });
  };

  hideAutoCompleteDropdown() {
    this.props.searchAutoComplete('');
  }

  handleSearchForInput(event) {
    const value = event.target.value;
    this.hideAutoCompleteDropdown();
    this.props.history.push({
      pathname: '/search',
      search: `q=${value}`,
      state: {
        query: value,
      },
    });
  }

  debouncedSearch = _.debounce(value => this.props.searchAutoComplete(value), 300);

  handleAutoCompleteSearch(value) {
    this.debouncedSearch(value);
  }

  handleSelectOnAutoCompleteDropdown(value, data) {
    if (data.props.marker === 'user') {
      this.props.history.push(`/@${value.replace('user', '')}`);
    } else if (data.props.marker === 'wobj') {
      this.props.history.replace(`/object/${value.replace('wobj', '')}`);
    } else this.props.history.push(`/objectType/${value.replace('type', '')}`);
  }

  handleOnChangeForAutoComplete(value, data) {
    if (data.props.marker) this.setState({searchBarValue: ''});
    else this.setState({searchBarValue: value});
  }

  usersSearchLayout(accounts) {
    return (
      <AutoComplete.OptGroup
        key="usersTitle"
        label={this.renderTitle(
          this.props.intl.formatMessage({
            id: 'users_search_title',
            defaultMessage: 'Users',
          }),
          _.size(accounts),
        )}
      >
        {_.map(accounts, option => (
          <AutoComplete.Option
            marker={'user'}
            key={`user${option.account}`}
            value={`user${option.account}`}
            className="Topnav__search-autocomplete"
          >
            <div className="Topnav__search-content-wrap">
              <Avatar username={option.account} size={40}/>
              <div className="Topnav__search-content">
                {option.account}
              </div>
            </div>
          </AutoComplete.Option>
        ))}
      </AutoComplete.OptGroup>
    );
  }

  wobjSearchCheckFields = option => {
    const parentString = getFieldWithMaxWeight(option.parent, objectFields.name);
    const titleSrting = getFieldWithMaxWeight(option, objectFields.title);
    const description = getFieldWithMaxWeight(option, objectFields.description);

    return parentString || titleSrting || description || '';
  };

  wobjectSearchLayout(wobjects) {
    return (

      <AutoComplete.OptGroup
        key="wobjectsTitle"
        label={this.renderTitle(
          this.props.intl.formatMessage({
            id: 'wobjects_search_title',
            defaultMessage: 'Objects',
          }),
          _.size(wobjects),
        )}
      >
        {_.map(wobjects, option => {

          const wobjName = getFieldWithMaxWeight(option, objectFields.name);
          console.log('TOPNAV_OPTION', option);
          return wobjName ? (
            <AutoComplete.Option
              marker={'wobj'}
              key={`wobj${wobjName}`}
              value={`wobj${option.author_permlink}`}
              className="Topnav__search-autocomplete"
            >
              <ObjectCard object={option} name={wobjName} type={option.object_type} parentElement={'Topnav'}/>
              {/*<React.Fragment>*/}
              {/*  <div className="Topnav__search-content-wrap">*/}
              {/*    <ObjectAvatar item={option} size={40}/>*/}
              {/*    <div>*/}
              {/*      <div className="Topnav__search-content">{wobjName}</div>*/}
              {/*      {parent && (*/}
              {/*        <div className="Topnav__search-content-small">*/}
              {/*          <div className="Topnav__search-content-small-test">*/}
              {/*            {this.wobjSearchCheckFields(option, objectFields)}*/}
              {/*          </div>*/}
              {/*        </div>*/}
              {/*      )}*/}
              {/*    </div>*/}
              {/*  </div>*/}
              {/*  <div className="Topnav__search-content-small">{option.object_type}</div>*/}
              {/*</React.Fragment>*/}
            </AutoComplete.Option>
          ) : null;
        })}
      </AutoComplete.OptGroup>

    );
  }

  wobjectTypeSearchLayout(objectTypes) {
    return (
      <AutoComplete.OptGroup
        key="typesTitle"
        label={this.renderTitle(
          this.props.intl.formatMessage({
            id: 'wobjectType_search_title',
            defaultMessage: 'Types',
          }),
          _.size(objectTypes),
        )}
      >
        {_.map(objectTypes, option => (
          <AutoComplete.Option
            marker={'type'}
            key={`type${option.name}`}
            value={`type${option.name}`}
            className="Topnav__search-autocomplete"
          >
            {option.name}
          </AutoComplete.Option>
        ))}
      </AutoComplete.OptGroup>
    );
  }

  prepareOptions(searchResults) {
    const dataSource = [];
    if (!_.isEmpty(searchResults.wobjects))
      dataSource.push(this.wobjectSearchLayout(searchResults.wobjects));
    if (!_.isEmpty(searchResults.accounts))
      dataSource.push(this.usersSearchLayout(searchResults.accounts));
    if (!_.isEmpty(searchResults.objectTypes))
      dataSource.push(this.wobjectTypeSearchLayout(searchResults.objectTypes));
    return dataSource;
  }

  toggleModalBroker = () => {
    this.props.toggleModal('broker');
  };

  toggleModalDeposit = () => {
    this.setState({isModalDeposit: !this.state.isModalDeposit});
  };

  renderTitle = title => <span>{title}</span>;

  render() {
    const {
      intl,
      autoCompleteSearchResults,
      platformName,
      isLoadingPlatform,
      isNightMode,
    } = this.props;
    console.log('TOPNAV', autoCompleteSearchResults);
    const {searchBarActive, isModalDeposit} = this.state;
    const dropdownOptions = this.prepareOptions(autoCompleteSearchResults);
    const formattedAutoCompleteDropdown = _.isEmpty(dropdownOptions)
      ? dropdownOptions
      : dropdownOptions.concat([
        <AutoComplete.Option disabled key="all" className="Topnav__search-all-results">
          <Link
            to={{
              pathname: '/search',
              search: `?q=${this.state.searchBarValue}`,
              state: {query: this.state.searchBarValue},
            }}
          >
              <span onClick={this.hideAutoCompleteDropdown} role="presentation">
                {intl.formatMessage(
                  {
                    id: 'search_all_results_for',
                    defaultMessage: 'Search all results for {search}',
                  },
                  {search: this.state.searchBarValue},
                )}
              </span>
          </Link>
        </AutoComplete.Option>,
      ]);
    const isMobile = this.props.screenSize === 'xsmall' || this.props.screenSize === 'small';
    return (
      <div className="Topnav">
        <ModalDealConfirmation/>
        <div className="topnav-layout">
          <div className={classNames('left', {'Topnav__mobile-hidden': searchBarActive})}>
            <Link className="Topnav__brand" to="/">
              WTrade
            </Link>
            <span className="Topnav__version">beta</span>
          </div>
          <div className={classNames('center', {mobileVisible: searchBarActive})}>
            <div className="Topnav__input-container">
              <AutoComplete
                dropdownClassName="Topnav__search-dropdown-container"
                dataSource={formattedAutoCompleteDropdown}
                onSearch={this.handleAutoCompleteSearch}
                onSelect={this.handleSelectOnAutoCompleteDropdown}
                onChange={this.handleOnChangeForAutoComplete}
                defaultActiveFirstOption={false}
                dropdownMatchSelectWidth={false}
                optionLabelProp="value"
                value={this.state.searchBarValue}
              >
                <Input
                  ref={ref => {
                    this.searchInputRef = ref;
                  }}
                  onPressEnter={this.handleSearchForInput}
                  placeholder={intl.formatMessage({
                    id: 'search_placeholder',
                    defaultMessage: 'What are you looking for?',
                  })}
                  autoCapitalize="off"
                  autoCorrect="off"
                />
              </AutoComplete>
              <i className="iconfont icon-search"/>
            </div>
          </div>
          <div className="right">
            <button
              className={classNames('Topnav__mobile-search', {
                'Topnav__mobile-search-close': searchBarActive,
              })}
              onClick={this.handleMobileSearchButtonClick}
            >
              <i
                className={classNames('iconfont', {
                  'icon-close': searchBarActive,
                  'icon-search': !searchBarActive,
                })}
              />
            </button>
            {this.content()}
          </div>
        </div>
        <div className="topnav-layout main-nav">
          <Menu
            selectedKeys={[this.state.selectedPage]}
            onClick={this.handleClickMenu}
            mode="horizontal"
          >
            <Menu.Item key={Topnav.MENU_ITEMS.HOME}>
              <NavLink to="/">
                {intl.formatMessage({id: 'home', defaultMessage: 'Home'}).toUpperCase()}
              </NavLink>
            </Menu.Item>
            <Menu.Item key={Topnav.MENU_ITEMS.MY_FEED} disabled={!this.props.username}>
              <NavLink to="/my_feed">
                {intl.formatMessage({id: 'my_feed', defaultMessage: 'My feed'}).toUpperCase()}
              </NavLink>
            </Menu.Item>
            <Menu.Item key={Topnav.MENU_ITEMS.MARKETS}>
              <NavLink to="/markets/crypto">
                {intl.formatMessage({id: 'markets', defaultMessage: 'Markets'}).toUpperCase()}
              </NavLink>
            </Menu.Item>
            <Menu.Item key={Topnav.MENU_ITEMS.DEALS} disabled={!this.props.username}>
              <NavLink to="/deals/open">
                {!isMobile
                  ? intl.formatMessage({id: 'my_deals', defaultMessage: 'My deals'}).toUpperCase()
                  : intl
                    .formatMessage({id: 'open_deals', defaultMessage: 'Open deals'})
                    .toUpperCase()}
              </NavLink>
            </Menu.Item>
            {isMobile && (
              <Menu.Item key={Topnav.MENU_ITEMS.CLOSEDDEALS}>
                <NavLink to="/deals/closed">
                  {intl
                    .formatMessage({id: 'closed_deals', defaultMessage: 'Closed deals'})
                    .toUpperCase()}
                </NavLink>
              </Menu.Item>
            )}
          </Menu>
          {platformName !== 'widgets' && !isLoadingPlatform ? (
            <div className="st-header-broker-balance-pl-wrap">
              <div className="st-balance-wrap">
                <div className="st-balance-text">
                  {intl.formatMessage({id: 'headerAuthorized.p&l', defaultMessage: 'P&L deals'})}:
                </div>
                <div className="st-balance-amount">
                  <Balance balanceType="unrealizedPnl"/>
                </div>
              </div>
              <div className="st-balance-border">
                <div className="st-balance-text">
                  {intl.formatMessage({
                    id: 'headerAuthorized.balance',
                    defaultMessage: 'Balance',
                  })}
                  :
                </div>
                <div className="st-balance-amount">
                  <Balance balanceType="balance"/>
                </div>
              </div>
              <Button type="primary" onClick={this.toggleModalDeposit}>
                {intl.formatMessage({id: 'headerAuthorized.deposit', defaultMessage: 'Deposit'})}
              </Button>
              <Modal
                title={intl.formatMessage({
                  id: 'headerAuthorized.deposit',
                  defaultMessage: 'Deposit',
                })}
                footer={null}
                visible={isModalDeposit}
                onCancel={this.toggleModalDeposit}
                width={1250}
                wrapClassName={'st-header-deposit-modal'}
                destroyOnClose
              >
                <iframe
                  title="depositFrame"
                  src={`${
                    config[process.env.NODE_ENV].platformDepositUrl[this.props.platformName]
                    }?${isNightMode ? 'style=wp&' : ''}mode=popup&lang=en#deposit`}
                  width="1200px"
                  height="696px"
                />
              </Modal>
              <img
                role="presentation"
                title={platformName}
                onClick={this.toggleModalBroker}
                className="st-header__image"
                src={`/images/investarena/${platformName}.png`}
                alt="broker"
              />
            </div>
          ) : (
            this.props.username && (
              <div className="st-header-broker-balance-pl-wrap">
                <Button type="primary" onClick={this.toggleModalBroker}>
                  {intl.formatMessage({
                    id: 'headerAuthorized.connectToBroker',
                    defaultMessage: 'Connect to broker',
                  })}
                </Button>
              </div>
            )
          )}
        </div>
      </div>
    );
  }
}

export default Topnav;
