export const displayLimit = 10;

export const preparePropositionReqData = ({ username, match, coordinates, radius }) => {
  const reqData = {
    limit: displayLimit,
    campaignParent: match.params.campaignParent,
    currentUserName: username,
  };
  if (coordinates && coordinates.length > 0 && radius) {
    reqData.coordinates = coordinates;
    reqData.radius = radius;
  }
  switch (match.params.filterKey) {
    case 'active':
      reqData.userName = username;
      break;
    case 'history':
      reqData.status = ['inactive', 'expired', 'deleted', 'payed'];
      break;
    case 'created':
      reqData.guideName = username;
      break;
    case 'reserved':
      reqData.userName = username;
      reqData.approved = true;
      break;
    default:
      break;
  }
  return reqData;
};