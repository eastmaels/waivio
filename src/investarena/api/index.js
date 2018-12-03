import Brokers from './Brokers';
import Authentications from './authentications/Authentications';
import ApiClient from './ApiClient';

export default function({ apiPrefix } = {}) {
  const api = new ApiClient({ prefix: apiPrefix});
  return {
    authentications: new Authentications({apiClient: api}),
    brokers: new Brokers({ apiClient: api }),
  };
}
