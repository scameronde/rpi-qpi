import { Server } from "@modelcontextprotocol/sdk/server/index.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js"

const SEARXNG_URL = "http://searxng.vier.services/search"

interface SearchResult {
  title: string
  url: string
  snippet: string
  engine?: string
}

interface SearXNGResponse {
  results: Array<{
    title: string
    url: string
    content: string
    engine?: string[]
  }>
  number_of_results?: number
  query?: string
}

interface FormattedResponse {
  query: string
  resultsFound: number
  results: SearchResult[]
  formattedResults: string
}

const server = new Server(
  { name: "searxng", version: "1.0.0" },
  { capabilities: { tools: {} } }
)

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "searxng_search",
      description:
        "Search the internet using SearXNG service. Returns up to 10 web search results with titles, URLs, and snippets.",
      inputSchema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description:
              "The search query (e.g., 'TypeScript documentation', 'React hooks tutorial')",
          },
          categories: {
            type: "string",
            description:
              "Comma-separated list of categories to search (e.g., 'general,social media')",
          },
          language: {
            type: "string",
            description: "Language code for results (e.g., 'en', 'de', 'fr')",
          },
          pageno: {
            type: "number",
            description: "Page number of results (default: 1)",
          },
          time_range: {
            type: "string",
            enum: ["day", "month", "year"],
            description: "Filter results by time range",
          },
          safesearch: {
            type: "number",
            description: "Safe search level: 0 (off), 1 (moderate), 2 (strict)",
          },
        },
        required: ["query"],
      },
    },
  ],
}))

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name !== "searxng_search") {
    throw new Error(`Unknown tool: ${request.params.name}`)
  }

  const args = request.params.arguments as Record<string, unknown>
  const query = args.query as string
  const categories = args.categories as string | undefined
  const language = args.language as string | undefined
  const pageno = (args.pageno as number) ?? 1
  const time_range = args.time_range as string | undefined
  const safesearch = args.safesearch as number | undefined

  try {
    const params = new URLSearchParams()
    params.append("q", query)
    params.append("format", "json")
    params.append("results_on_new_tab", "0")
    params.append("pageno", pageno.toString())

    if (categories) params.append("categories", categories)
    if (language) params.append("language", language)
    if (time_range) params.append("time_range", time_range)
    if (safesearch !== undefined)
      params.append("safesearch", safesearch.toString())

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    const response = await fetch(`${SEARXNG_URL}?${params.toString()}`, {
      method: "GET",
      headers: {
        "User-Agent": "Claude-SearXNG-MCP/1.0",
        Accept: "application/json",
      },
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(
        `SearXNG API error: ${response.status} ${response.statusText}`
      )
    }

    const data = (await response.json()) as SearXNGResponse

    const limitedResults: SearchResult[] = (data.results || [])
      .slice(0, 10)
      .map((result) => ({
        title: result.title,
        url: result.url,
        snippet: result.content,
        engine: result.engine?.[0],
      }))

    let formattedResults = ""
    if (limitedResults.length > 0) {
      formattedResults = limitedResults
        .map(
          (result, index) =>
            `${index + 1}. ${result.title}\n   URL: ${result.url}\n   ${result.snippet}`
        )
        .join("\n\n")
    } else {
      formattedResults = "No results found for the given query."
    }

    const responseData: FormattedResponse = {
      query,
      resultsFound: data.number_of_results || limitedResults.length,
      results: limitedResults,
      formattedResults,
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(responseData, null, 2),
        },
      ],
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              query,
              error: true,
              errorMessage: `Failed to search SearXNG: ${errorMessage}`,
              results: [],
              formattedResults: `Error: ${errorMessage}`,
            },
            null,
            2
          ),
        },
      ],
    }
  }
})

const transport = new StdioServerTransport()
await server.connect(transport)
