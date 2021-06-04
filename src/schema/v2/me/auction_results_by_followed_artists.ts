import { GraphQLFieldConfig } from "graphql"
import gql from "lib/gql"
import { pageable } from "relay-cursor-paging"
import { params } from "schema/v1/home/add_generic_genes"
import { ResolverContext } from "types/graphql"
import { auctionResultConnection } from "../auction_result"

const MAX_FOLLOWED_ARTISTS = 50
const MAX_AUCTION_RESULTS = 100

const AuctionResultsByFollowedArtists: GraphQLFieldConfig<
  void,
  ResolverContext
> = {
  type: auctionResultConnection.connectionType,
  args: pageable({}),
  description: "A list of the auction results by followed artists",
  resolve: async (
    _root,
    options,
    { followedArtistsLoader, diffusionGraphqlLoader }
  ) => {
    try {
      if (!followedArtistsLoader || !diffusionGraphqlLoader) return null

      const gravityArgs = {
        size: 50,
        offset: 0,
        total_count: false,
        ...params,
      }
      const { body: followedArtists } = await followedArtistsLoader(gravityArgs)

      // Prepare diffusion args
      const followedArtistIds = followedArtists
        .slice(0, MAX_FOLLOWED_ARTISTS)
        .map((artist) => artist.artist._id)
      const { after, first } = options

      const auctionResults = await diffusionGraphqlLoader({
        query: gql`
          query AuctionResultsByArtistsConnection(
            $artistIds: [ID!]!
            $first: Int
          ) {
            auctionResultsByArtistsConnection(
              artistIds: $artistIds
              first: $first
            ) {
              totalCount
              edges {
                node {
                  artistId
                  boughtIn
                  categoryText
                  currency
                  date
                  dateText
                  depthCm
                  description
                  diameterCm
                  dimensionText
                  externalUrl
                  hammerPriceCents
                  hammerPriceCentsUsd
                  heightCm
                  highEstimateCents
                  highEstimateCentsUsd
                  id
                  location
                  lowEstimateCents
                  lowEstimateCentsUsd
                  mediumText
                  organization
                  priceRealizedCents
                  priceRealizedCentsUsd
                  saleDate
                  saleDateText
                  saleOverEstimatePercentage
                  saleTitle
                  title
                  widthCm
                }
              }
            }
          }
        `,
        variables: {
          artistIds: followedArtistIds,
          first: MAX_AUCTION_RESULTS,
        },
      })

      // Prepare connection
      const connection: any = auctionResults?.auctionResultsByArtistsConnection
      connection.totalCount = connection?.edges?.length || 0
      connection.edges = connection?.edges?.slice(+after, +after + first)

      return auctionResults?.auctionResultsByArtistsConnection
    } catch (error) {
      console.error(error)
      throw new Error(error)
    }
  },
}

export default AuctionResultsByFollowedArtists
