import _ from 'lodash';
import React from 'react';
import { Button, Icon, Tag } from 'antd';
import PropTypes from 'prop-types';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { haveAccess, hasType, accessTypesArr } from '../../helpers/wObjectHelper';
import SocialLinks from '../../components/SocialLinks';
import {
  getFieldWithMaxWeight,
  getFieldsCount,
  getInnerFieldWithMaxWeight,
  sortListItemsBy,
  getField,
} from '../../object/wObjectHelper';
import {
  objectFields,
  TYPES_OF_MENU_ITEM,
  addressFields,
  linkFields,
  getAllowedFieldsByObjType,
} from '../../../common/constants/listOfFields';
import URL from '../../../common/constants/routing';
import OBJECT_TYPE from '../../object/const/objectTypes';
import Proposition from '../../components/Proposition/Proposition';
import { isCoordinatesValid } from '../../components/Maps/mapHelper';
import PicturesCarousel from '../../object/PicturesCarousel';
import IconButton from '../../components/IconButton';
import { getIsAuthenticated, getObjectAlbums, getScreenSize } from '../../reducers';
import DescriptionInfo from './DescriptionInfo';
import CreateImage from '../../object/ObjectGallery/CreateImage';
import RateInfo from '../../components/Sidebar/Rate/RateInfo';
import MapObjectInfo from '../../components/Maps/MapObjectInfo';
import ObjectCard from '../../components/Sidebar/ObjectCard';
import InstrumentLongTermStatistics from '../../../investarena/components/LeftSidebar/LongTermStatistics/InstrumentLongTermStatistics';
import ModalComparePerformance from '../../../investarena/components/Modals/ModalComparePerformance/ModalComparePerformance';
import getClientWObject from '../../adapters';
import './ObjectInfo.less';

@withRouter
@connect(state => ({
  albums: getObjectAlbums(state),
  isAuthenticated: getIsAuthenticated(state),
  screenSize: getScreenSize(state),
}))
class ObjectInfo extends React.Component {
  static propTypes = {
    location: PropTypes.shape().isRequired,
    wobject: PropTypes.shape().isRequired,
    userName: PropTypes.string.isRequired,
    isEditMode: PropTypes.bool.isRequired,
    isAuthenticated: PropTypes.bool.isRequired,
    screenSize: PropTypes.bool.isRequired,
    albums: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  };

  state = {
    selectedField: null,
    showModal: false,
    showMore: false,
    isModalComparePerformanceOpen: false,
  };

  handleSelectField = field => () => this.setState({ selectedField: field });

  handleToggleModal = () => this.setState(prevState => ({ showModal: !prevState.showModal }));
  toggleModalPerformance = () =>
    this.setState(prevState => ({
      isModalComparePerformanceOpen: !prevState.isModalComparePerformanceOpen,
    }));

  render() {
    const { location, wobject, userName, albums, isAuthenticated } = this.props;
    const isEditMode = isAuthenticated ? this.props.isEditMode : false;
    const { showModal, selectedField, isModalComparePerformanceOpen } = this.state;
    const renderFields = getAllowedFieldsByObjType(wobject.object_type);
    const isRenderGallery = ![OBJECT_TYPE.LIST, OBJECT_TYPE.PAGE].includes(wobject.object_type);
    const isRenderAboutSection = isRenderGallery;
    const isRenderMenu = isRenderGallery;

    let addressArr = [];
    let address = '';
    let map = '';
    let description = '';
    let price = '';
    let link = '';
    let title = '';
    let workTime = '';
    let buttonTitle = '';
    let buttonLink = '';
    let websiteFields = {};
    let buttonFields = {};
    let avatar = '';
    let short = '';
    let background = '';
    let photosCount = 0;
    let tags = [];
    let phones = [];
    let email = '';
    let menuItems = [];
    let menuLists = null;
    let menuPages = null;

    if (_.size(wobject) > 0) {
      const adressFields = getInnerFieldWithMaxWeight(wobject, objectFields.address);
      addressArr = adressFields
        ? Object.values(addressFields).map(fieldName => adressFields[fieldName])
        : [];
      address = _.compact(addressArr).join(', ');

      map = getInnerFieldWithMaxWeight(wobject, objectFields.map);

      description = getFieldWithMaxWeight(wobject, objectFields.description);

      avatar = getInnerFieldWithMaxWeight(wobject, objectFields.avatar);
      background = getFieldWithMaxWeight(wobject, objectFields.background);

      short = getFieldWithMaxWeight(wobject, objectFields.title);

      workTime = getFieldWithMaxWeight(wobject, objectFields.workTime);

      email = getFieldWithMaxWeight(wobject, objectFields.email);

      price = getFieldWithMaxWeight(wobject, objectFields.price);

      menuItems = _.get(wobject, 'menuItems', []);
      menuLists =
        menuItems.length && menuItems.some(item => item.object_type === OBJECT_TYPE.LIST)
          ? _.uniqBy(menuItems, 'author_permlink').filter(
              item => item.object_type === OBJECT_TYPE.LIST,
            )
          : null;
      menuPages =
        menuItems.length && menuItems.some(item => item.object_type !== OBJECT_TYPE.LIST)
          ? _.uniqBy(menuItems, 'author_permlink').filter(
              item => item.object_type !== OBJECT_TYPE.LIST,
            )
          : null;

      websiteFields = getInnerFieldWithMaxWeight(wobject, objectFields.website);
      if (websiteFields) {
        title = websiteFields.title;
        link = websiteFields.link;
      }
      buttonFields = getInnerFieldWithMaxWeight(wobject, objectFields.button);
      if (buttonFields) {
        buttonTitle = buttonFields.title;
        buttonLink = buttonFields.link;
      }
      photosCount = wobject.photos_count;

      const filtered = _.filter(wobject.fields, ['name', objectFields.tagCloud]);
      tags = _.orderBy(filtered, ['weight'], ['desc']);

      const filteredPhones = _.filter(wobject.fields, ['name', objectFields.phone]);
      phones = _.orderBy(filteredPhones, ['weight'], ['desc']);
    }

    if (link && link.indexOf('http://') === -1 && link.indexOf('https://') === -1) {
      link = `http://${link}`;
    }
    const linkField = getInnerFieldWithMaxWeight(wobject, objectFields.link);
    let profile = linkField
      ? {
          facebook: linkField[linkFields.linkFacebook] || '',
          twitter: linkField[linkFields.linkTwitter] || '',
          youtube: linkField[linkFields.linkYouTube] || '',
          instagram: linkField[linkFields.linkInstagram] || '',
          github: linkField[linkFields.linkGitHub] || '',
        }
      : {};

    profile = _.pickBy(profile, _.identity);
    const accessExtend = haveAccess(wobject, userName, accessTypesArr[0]) && isEditMode;
    const objectName = getFieldWithMaxWeight(wobject, objectFields.name, objectFields.name);
    const album = _.filter(albums, _.iteratee(['id', wobject.author_permlink]));
    const hasGalleryImg = wobject.preview_gallery && wobject.preview_gallery[0];

    const isRenderMap =
      map && map.latitude && map.longitude && isCoordinatesValid(map.latitude, map.longitude);

    // name - name of field OR type of menu-item (TYPES_OF_MENU_ITEM)
    const listItem = (name, content) => {
      const fieldsCount = getFieldsCount(wobject, name);
      const shouldDisplay = renderFields.includes(name) || _.includes(TYPES_OF_MENU_ITEM, name);
      return shouldDisplay && (content || accessExtend) ? (
        <div className="field-info">
          <React.Fragment>
            {accessExtend && (
              <div className="field-info__title">
                <Proposition
                  objectID={wobject.author_permlink}
                  fieldName={name}
                  objName={objectName}
                  handleSelectField={this.handleSelectField}
                  selectedField={selectedField}
                  linkTo={
                    name === objectFields.pageContent
                      ? `/object/${wobject.author_permlink}/${OBJECT_TYPE.PAGE}`
                      : ''
                  }
                />
                {fieldsCount}
              </div>
            )}
            {content ? (
              <div
                className={`field-info__content ${name}-field-${isEditMode ? 'edit' : 'view'}`}
                data-test={`${name}-field-view`}
              >
                {content}
              </div>
            ) : null}
          </React.Fragment>
        </div>
      ) : null;
    };

    const getMenuSectionLink = item => (
      <div className="object-sidebar__menu-item" key={item.author_permlink}>
        <Link
          className={location.hash.slice(1).split('/')[0] === item.author_permlink ? 'active' : ''}
          to={`/object/${wobject.author_permlink}/${URL.SEGMENT.MENU}#${item.author_permlink}`}
        >
          {item.alias || getFieldWithMaxWeight(item, objectFields.name)}
        </Link>
      </div>
    );
    const menuSection = (
      <React.Fragment>
        {isEditMode && (
          <div className="object-sidebar__section-title">
            <FormattedMessage id="menu" defaultMessage="Menu" />
          </div>
        )}
        <div className="object-sidebar__menu-items">
          {isEditMode && (
            <React.Fragment>
              {listItem(
                TYPES_OF_MENU_ITEM.LIST,
                menuLists && menuLists.map(item => getMenuSectionLink(item)),
              )}
              {listItem(
                TYPES_OF_MENU_ITEM.PAGE,
                menuPages && menuPages.map(item => getMenuSectionLink(item)),
              )}
            </React.Fragment>
          )}
          {!isEditMode &&
            sortListItemsBy(
              menuItems.map(menuItem =>
                getClientWObject(menuItem, ['author_permlink', 'default_name', 'alias']),
              ),
              'custom',
              _.get(wobject, 'sortCustom', null),
            ).map(item => getMenuSectionLink(item))}
          {!_.isEmpty(menuItems) && listItem(objectFields.sorting, null)}
        </div>
      </React.Fragment>
    );

    const listSection = (
      <React.Fragment>
        <div className="object-sidebar__section-title">
          <FormattedMessage id="list" defaultMessage="List" />
        </div>
        {listItem(objectFields.sorting, null)}
      </React.Fragment>
    );

    const settingsSection = (
      <React.Fragment>
        <div className="object-sidebar__section-title">
          <FormattedMessage id="settings" defaultMessage="Settings" />
        </div>
        {listItem(
          objectFields.avatar,
          avatar ? (
            <div className="field-avatar">
              <img src={avatar} alt="pic" />
            </div>
          ) : null,
        )}
        {listItem(objectFields.title, short)}
        {listItem(
          objectFields.background,
          background ? (
            <div className="field-background">
              <img src={background} alt="pic" />
            </div>
          ) : null,
        )}
      </React.Fragment>
    );
    const hasChartId = getField(wobject, objectFields.chartId);
    const isMobile = this.props.screenSize === 'xsmall';

    return (
      <React.Fragment>
        {getFieldWithMaxWeight(wobject, objectFields.name) && (
          <div className="object-sidebar">
            {listItem(
              objectFields.parent,
              wobject.parent ? (
                <ObjectCard
                  key={wobject.parent.author_permlink}
                  wobject={wobject.parent}
                  showFollow={false}
                />
              ) : null,
            )}
            {hasType(wobject, OBJECT_TYPE.PAGE) && listItem(objectFields.pageContent, null)}
            {isRenderMenu && menuSection}
            {isRenderAboutSection && (
              <React.Fragment>
                {isEditMode && (
                  <div className="object-sidebar__section-title">
                    <FormattedMessage id="about" defaultMessage="About" />
                  </div>
                )}
                {listItem(
                  objectFields.button,
                  buttonTitle && (
                    <Button
                      type="primary"
                      className="field-button"
                      href={buttonLink}
                      target={'_blank'}
                    >
                      {buttonTitle}
                    </Button>
                  ),
                )}
                {listItem(objectFields.description, <DescriptionInfo description={description} />)}
                {hasChartId && (
                  <React.Fragment>
                    <InstrumentLongTermStatistics
                      wobject={this.props.wobject}
                      withCompareButton
                      toggleModalPerformance={this.toggleModalPerformance}
                      isMobile={isMobile}
                    />
                    {isModalComparePerformanceOpen && wobject && !isMobile && (
                      <ModalComparePerformance
                        toggleModal={this.toggleModalPerformance}
                        isModalOpen={isModalComparePerformanceOpen}
                        item={this.props.wobject}
                        isItemUser={false}
                      />
                    )}
                  </React.Fragment>
                )}
                {listItem(
                  objectFields.rating,
                  <RateInfo username={userName} authorPermlink={wobject.author_permlink} />,
                )}
                {listItem(
                  objectFields.tagCloud,
                  <div className="field-info">
                    {accessExtend ? (
                      <React.Fragment>
                        {tags.length <= 3 ? (
                          tags.slice(0, 3).map(({ body }) => (
                            <div key={body} className="tag-item">
                              {body}
                            </div>
                          ))
                        ) : (
                          <React.Fragment>
                            {tags.slice(0, 2).map(({ body }) => (
                              <div key={body} className="tag-item">
                                {body}
                              </div>
                            ))}
                            <Link
                              to={`/object/${wobject.author_permlink}/updates/${
                                objectFields.tagCloud
                              }`}
                              onClick={() => this.handleSelectField(objectFields.tagCloud)}
                            >
                              <FormattedMessage id="show_more_tags" defaultMessage="show more">
                                {value => <div className="tag-item">{value}</div>}
                              </FormattedMessage>
                            </Link>
                          </React.Fragment>
                        )}
                      </React.Fragment>
                    ) : (
                      <React.Fragment>
                        {tags.slice(0, 3).map(({ body }) => (
                          <Tag key={body} color="volcano">
                            {body}
                          </Tag>
                        ))}
                      </React.Fragment>
                    )}
                  </div>,
                )}
                {isRenderGallery && (hasGalleryImg || accessExtend) ? (
                  <div className="field-info">
                    {accessExtend && (
                      <div className="proposition-line">
                        <Link
                          to={{ pathname: `/object/${wobject.author_permlink}/gallery` }}
                          onClick={() => this.handleSelectField('gallery')}
                        >
                          <IconButton
                            icon={<Icon type="plus-circle" />}
                            onClick={this.handleToggleModal}
                          />
                          <div
                            className={`icon-button__text ${
                              selectedField === 'gallery' ? 'field-selected' : ''
                            }`}
                          >
                            <FormattedMessage id="object_field_gallery" defaultMessage="Gallery" />
                          </div>
                        </Link>
                        <span className="proposition-line__text">{photosCount}</span>
                        {showModal && (
                          <CreateImage
                            albums={albums}
                            selectedAlbum={album[0]}
                            showModal={showModal}
                            hideModal={this.handleToggleModal}
                          />
                        )}
                      </div>
                    )}
                    {hasGalleryImg && (
                      <PicturesCarousel
                        pics={wobject.preview_gallery}
                        objectID={wobject.author_permlink}
                      />
                    )}
                  </div>
                ) : null}
                {listItem(
                  objectFields.price,
                  price ? <div className="icon-price">{price}</div> : <div />,
                )}
                {listItem(objectFields.workTime, <React.Fragment>{workTime}</React.Fragment>)}
                {listItem(
                  objectFields.address,
                  address && (
                    <React.Fragment>
                      <i className="iconfont icon-coordinates text-icon" />
                      {address}
                      {isRenderMap && (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${map.latitude},${
                            map.longitude
                          }`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="address-link"
                        >
                          <i className="iconfont icon-send PostModal__icon" />
                        </a>
                      )}
                    </React.Fragment>
                  ),
                )}
                {listItem(
                  objectFields.map,
                  isRenderMap && (
                    <MapObjectInfo
                      mapHeigth={200}
                      center={[Number(map.latitude), Number(map.longitude)]}
                    />
                  ),
                )}
                {listItem(
                  objectFields.website,
                  title && (
                    <div className="field-website">
                      <span className="field-website__title">
                        <i className="iconfont icon-link text-icon" />
                        <a target="_blank" rel="noopener noreferrer" href={link}>
                          {title}
                        </a>
                      </span>
                    </div>
                  ),
                )}
                {listItem(
                  objectFields.phone,
                  <div className="field-info">
                    {accessExtend ? (
                      <React.Fragment>
                        {phones.length <= 3 ? (
                          phones.slice(0, 3).map(({ body, number }) => (
                            <div key={number} className="phone">
                              <Icon type="phone" /> <a href={`tel:${number}`}>{number}</a>
                              {body && body} <br />
                            </div>
                          ))
                        ) : (
                          <React.Fragment>
                            {phones.slice(0, 2).map(({ body, number }) => (
                              <div key={`${number}${body}`} className="phone">
                                {body && body} <br />
                                <Icon type="phone" /> <a href={`tel:${number}`}>{number}</a>
                              </div>
                            ))}
                            <Link
                              to={`/object/${wobject.author_permlink}/updates/${
                                objectFields.phone
                              }`}
                              onClick={() => this.handleSelectField(objectFields.phone)}
                            >
                              <FormattedMessage id="show_more_tags" defaultMessage="show more">
                                {value => <div className="phone">{value}</div>}
                              </FormattedMessage>
                            </Link>
                          </React.Fragment>
                        )}
                      </React.Fragment>
                    ) : (
                      <React.Fragment>
                        {phones.slice(0, 3).map(({ body, number }) => (
                          <div key={number}>
                            {body && body} <br />
                            <Icon type="phone" /> <a href={`tel:${number}`}>{number}</a>
                          </div>
                        ))}
                      </React.Fragment>
                    )}
                  </div>,
                )}
                {listItem(
                  objectFields.email,
                  email && (
                    <div className="field-info">
                      {accessExtend ? (
                        <div className="email">
                          <Icon type="mail" /> {email}
                        </div>
                      ) : (
                        <React.Fragment>
                          <Icon type="mail" />
                          <a href={`mailto:${email}`}> {email}</a>
                        </React.Fragment>
                      )}
                    </div>
                  ),
                )}
                {listItem(objectFields.link, <SocialLinks profile={profile} />)}
              </React.Fragment>
            )}
            {accessExtend && hasType(wobject, OBJECT_TYPE.LIST) && listSection}
            {accessExtend && settingsSection}
          </div>
        )}
      </React.Fragment>
    );
  }
}

export default ObjectInfo;
