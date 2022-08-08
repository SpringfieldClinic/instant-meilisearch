import {
  AlgoliaMultipleQueriesQuery,
  AlgoliaSearchResponse,
  InstantMeiliSearchInstance,
  InstantMeiliSearchOptions,
  SearchCacheInterface,
  SearchContext,
} from '../types'
import { SearchCache, cacheFirstFacetDistribution } from '../cache/'
import {
  SearchResolver,
  adaptSearchParams,
  adaptSearchResponse,
} from '../adapter'

import { MeiliSearch } from 'meilisearch'
import { constructClientAgents } from './agents'
import { createSearchContext } from '../contexts'

/**
 * Instanciate SearchClient required by instantsearch.js.
 *
 * @param  {string} hostUrl
 * @param  {string} apiKey
 * @param  {InstantMeiliSearchOptions={}} meiliSearchOptions
 * @returns {InstantMeiliSearchInstance}
 */
export function instantMeiliSearch(
  hostUrl: string,
  apiKey = '',
  instantMeiliSearchOptions: InstantMeiliSearchOptions = {}
): InstantMeiliSearchInstance {
  // create search resolver with included cache
  const searchCache = SearchCache()
  const searchResolver = SearchResolver(searchCache)
  // paginationTotalHits can be 0 as it is a valid number
  let defaultFacetDistribution: any = {}
  const clientAgents = constructClientAgents(
    instantMeiliSearchOptions.clientAgents
  )

  const meilisearchClient = new MeiliSearch({
    host: hostUrl,
    apiKey: apiKey,
    clientAgents,
  })

  return {
    getCache: (): SearchCacheInterface => {
      return searchCache
    },

    clearCache: () => searchCache.clearCache(),

    /**
     * @param  {readonlyAlgoliaMultipleQueriesQuery[]} instantSearchRequests
     * @returns {Array}
     */
    search: async function <T = Record<string, any>>(
      instantSearchRequests: readonly AlgoliaMultipleQueriesQuery[]
    ): Promise<{ results: Array<AlgoliaSearchResponse<T>> }> {
      const searchRequest = instantSearchRequests[0]
      const searchContext: SearchContext = createSearchContext(
        searchRequest,
        instantMeiliSearchOptions,
        defaultFacetDistribution
      )

      // Adapt search request to Meilisearch compliant search request
      const adaptedSearchRequest = adaptSearchParams(searchContext)

      // Search response from Meilisearch
      const searchResponse = await searchResolver.searchResponse(
        searchContext,
        adaptedSearchRequest,
        meilisearchClient
      )

      // Cache first facets distribution of the instantMeilisearch instance
      // Needed to add in the facetDistribution the fields that were not returned
      // When the user sets `keepZeroFacets` to true.
      defaultFacetDistribution = cacheFirstFacetDistribution(
        defaultFacetDistribution,
        searchResponse
      )

      // Adapt the Meilisearch responsne to a compliant instantsearch.js response
      const adaptedSearchResponse = adaptSearchResponse<T>(
        searchResponse,
        searchContext
      )

      return adaptedSearchResponse
    },

    searchForFacetValues: async function (_: any) {
      return await new Promise((resolve, reject) => {
        reject(
          new Error('SearchForFacetValues is not compatible with Meilisearch')
        )
        resolve([]) // added here to avoid compilation error
      })
    },
  }
}
