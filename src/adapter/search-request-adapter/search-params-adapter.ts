import type { MeiliSearchParams, SearchContext } from '../../types'

import {
  adaptGeoPointsRules,
  createGeoSearchContext,
} from './geo-rules-adapter'
import { adaptFilters } from './filter-adapter'

/**
 * Adapt search request from instantsearch.js
 * to search request compliant with Meilisearch
 *
 * @param  {SearchContext} searchContext
 * @returns {MeiliSearchParams}
 */
export function adaptSearchParams(
  searchContext: SearchContext
): MeiliSearchParams {
  // Creates search params object compliant with Meilisearch
  const meiliSearchParams: Record<string, any> = {}

  // Facets
  const facets = searchContext?.facets
  if (facets?.length) {
    meiliSearchParams.facets = facets
  }

  // Attributes To Crop
  const attributesToCrop = searchContext?.attributesToSnippet
  if (attributesToCrop) {
    meiliSearchParams.attributesToCrop = attributesToCrop
  }

  // Attributes To Crop marker
  const cropMarker = searchContext?.snippetEllipsisText
  if (cropMarker != null) {
    meiliSearchParams.cropMarker = cropMarker
  }

  // Attributes To Retrieve
  const attributesToRetrieve = searchContext?.attributesToRetrieve
  if (attributesToRetrieve) {
    meiliSearchParams.attributesToRetrieve = attributesToRetrieve
  }

  // Filter
  const filter = adaptFilters(
    searchContext?.filters,
    searchContext?.numericFilters,
    searchContext?.facetFilters
  )
  if (filter.length) {
    meiliSearchParams.filter = filter
  }

  // Attributes To Retrieve
  if (attributesToRetrieve) {
    meiliSearchParams.attributesToCrop = attributesToRetrieve
  }

  // Attributes To Highlight
  meiliSearchParams.attributesToHighlight = searchContext?.attributesToHighlight || [
    '*',
  ]

  // Highlight pre tag
  const highlightPreTag = searchContext?.highlightPreTag
  if (highlightPreTag) {
    meiliSearchParams.highlightPreTag = highlightPreTag
  } else {
    meiliSearchParams.highlightPreTag = '__ais-highlight__'
  }

  // Highlight post tag
  const highlightPostTag = searchContext?.highlightPostTag
  if (highlightPostTag) {
    meiliSearchParams.highlightPostTag = highlightPostTag
  } else {
    meiliSearchParams.highlightPostTag = '__/ais-highlight__'
  }

  const placeholderSearch = searchContext.placeholderSearch
  const query = searchContext.query

  // Pagination
  const { pagination } = searchContext

  // Limit based on pagination preferences
  if (!placeholderSearch && query === '') {
    meiliSearchParams.hitsPerPage = 0
    meiliSearchParams.page = pagination.page + 1
  } else {
    meiliSearchParams.page = pagination.page + 1
    meiliSearchParams.hitsPerPage = pagination.hitsPerPage
  }

  const sort = searchContext.sort

  // Sort
  if (sort?.length) {
    meiliSearchParams.sort = [sort]
  }

  const geoSearchContext = createGeoSearchContext(searchContext)
  const geoRules = adaptGeoPointsRules(geoSearchContext)

  if (geoRules?.filter) {
    if (meiliSearchParams.filter) {
      meiliSearchParams.filter.unshift(geoRules.filter)
    } else {
      meiliSearchParams.filter = [geoRules.filter]
    }
  }

  console.log(meiliSearchParams)
  return meiliSearchParams
}
