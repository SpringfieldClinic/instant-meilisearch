import {
  MeiliSearch,
  MeiliSearchParams,
  MeiliSearchResponse,
  SearchContext,
} from '../../types'
/**
 * @param  {MeiliSearch} client
 * @param  {SearchContext} context
 * @param  {MeiliSearchParams} searchRequest
 * @returns {Promise<MeiliSearchResponse>}
 */
export async function search(
  client: MeiliSearch,
  context: SearchContext,
  searchRequest: MeiliSearchParams
): Promise<MeiliSearchResponse> {
  return client.index(context.indexUid).search(context.query, searchRequest)
}
