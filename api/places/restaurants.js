import { handlePlacesRequest } from '../../server/googlePlacesApi.js';

export default function handler(request, response) {
  return handlePlacesRequest(request, response, 'restaurants');
}
