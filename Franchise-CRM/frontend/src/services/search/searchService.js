import { request } from '../../api/httpClient';
import { USE_MOCK, delay, franchisesFor, eventsFor } from '../shared';

export async function getSearchIndex(user) {
  if (!USE_MOCK) return request('/search-index');
  await delay(100);
  return { franchises: franchisesFor(user), events: eventsFor(user) };
}