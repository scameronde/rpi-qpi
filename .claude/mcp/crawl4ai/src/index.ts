import { Server } from "@modelcontextprotocol/sdk/server/index.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js"

const BASE_URL = "http://crawl4ai.vier.services:11235"

interface CrawlerConfig {
  cache_mode?: "enabled" | "disabled" | "bypass" | "read_only" | "write_only"
  css_selector?: string
  word_count_threshold?: number
}

interface BrowserConfig {
  headless?: boolean
  user_agent?: string
}

interface CrawlRequest {
  urls: string[]
  crawler_config?: CrawlerConfig
  browser_config?: BrowserConfig
}

interface MarkdownRequest {
  url: string
  f?: "raw" | "fit" | "bm25" | "llm"
  q?: string
}

interface ScreenshotRequest {
  url: string
  screenshot_wait_for?: number
}

interface CrawlResult {
  url: string
  success: boolean
  markdown?: string
  media?: { images: string[]; videos: string[] }
  metadata?: { title?: string; description?: string }
  error_message?: string
}

const server = new Server(
  { name: "crawl4ai", version: "1.0.0" },
  { capabilities: { tools: {} } }
)

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "crawl4ai",
      description:
        "Extract content from web pages using Crawl4AI service. Supports three modes: crawl (full page extraction), markdown (focused Markdown with filtering), screenshot (page capture as PNG).",
      inputSchema: {
        type: "object",
        properties: {
          url: {
            type: "string",
            description: "The URL to crawl/extract content from",
          },
          mode: {
            type: "string",
            enum: ["crawl", "markdown", "screenshot"],
            description:
              "Operation mode: crawl (full extraction), markdown (filtered Markdown), screenshot (PNG capture). Default: crawl",
          },
          cache_mode: {
            type: "string",
            enum: ["enabled", "disabled", "bypass", "read_only", "write_only"],
            description: "Cache behavior for crawl mode",
          },
          css_selector: {
            type: "string",
            description: "CSS selector to extract specific content (crawl mode)",
          },
          word_count_threshold: {
            type: "number",
            description:
              "Minimum word count for content blocks (crawl mode)",
          },
          markdown_filter: {
            type: "string",
            enum: ["raw", "fit", "bm25", "llm"],
            description: "Markdown filter type (markdown mode). Default: fit",
          },
          filter_query: {
            type: "string",
            description: "Query for bm25/llm filters (markdown mode)",
          },
          screenshot_wait: {
            type: "number",
            description:
              "Wait time in seconds before screenshot (screenshot mode). Default: 2",
          },
          headless: {
            type: "boolean",
            description: "Run browser in headless mode. Default: true",
          },
          user_agent: {
            type: "string",
            description: "Custom user agent string",
          },
        },
        required: ["url"],
      },
    },
  ],
}))

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name !== "crawl4ai") {
    throw new Error(`Unknown tool: ${request.params.name}`)
  }

  const args = request.params.arguments as Record<string, unknown>
  const url = args.url as string
  const mode = (args.mode as string) ?? "crawl"
  const cache_mode = args.cache_mode as string | undefined
  const css_selector = args.css_selector as string | undefined
  const word_count_threshold = args.word_count_threshold as number | undefined
  const markdown_filter = (args.markdown_filter as string) ?? "fit"
  const filter_query = args.filter_query as string | undefined
  const screenshot_wait = (args.screenshot_wait as number) ?? 2
  const headless = (args.headless as boolean) ?? true
  const user_agent = args.user_agent as string | undefined

  try {
    let endpoint = ""
    let requestBody: CrawlRequest | MarkdownRequest | ScreenshotRequest
    let formattedOutput = ""

    if (mode === "crawl") {
      endpoint = "/crawl"

      const crawler_config: CrawlerConfig = {}
      if (cache_mode)
        crawler_config.cache_mode = cache_mode as CrawlerConfig["cache_mode"]
      if (css_selector) crawler_config.css_selector = css_selector
      if (word_count_threshold)
        crawler_config.word_count_threshold = word_count_threshold

      const browser_config: BrowserConfig = {}
      if (headless !== undefined) browser_config.headless = headless
      if (user_agent) browser_config.user_agent = user_agent

      requestBody = {
        urls: [url],
        crawler_config:
          Object.keys(crawler_config).length > 0 ? crawler_config : undefined,
        browser_config:
          Object.keys(browser_config).length > 0 ? browser_config : undefined,
      }
    } else if (mode === "markdown") {
      endpoint = "/md"

      const mdRequest: MarkdownRequest = {
        url,
        f: markdown_filter as MarkdownRequest["f"],
      }
      if (
        filter_query &&
        (markdown_filter === "bm25" || markdown_filter === "llm")
      ) {
        mdRequest.q = filter_query
      }
      requestBody = mdRequest
    } else if (mode === "screenshot") {
      endpoint = "/screenshot"

      requestBody = {
        url,
        screenshot_wait_for: screenshot_wait,
      }
    } else {
      throw new Error(`Invalid mode: ${mode}`)
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "User-Agent": "Claude-Crawl4AI-MCP/1.0",
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(
        `Crawl4AI API error: ${response.status} ${response.statusText}`
      )
    }

    const data = await response.json()

    if (mode === "crawl") {
      const results = data.results || [data]
      const crawlResult = results[0] as CrawlResult

      if (crawlResult.success) {
        formattedOutput = `Successfully crawled: ${url}\n\n`
        if (crawlResult.metadata?.title) {
          formattedOutput += `Title: ${crawlResult.metadata.title}\n`
        }
        if (crawlResult.metadata?.description) {
          formattedOutput += `Description: ${crawlResult.metadata.description}\n`
        }
        if (crawlResult.markdown) {
          const preview = crawlResult.markdown.substring(0, 500)
          const truncated = crawlResult.markdown.length > 500 ? "..." : ""
          formattedOutput += `\nMarkdown Content:\n${preview}${truncated}\n`
        }
        if (crawlResult.media) {
          formattedOutput += `\nMedia: ${crawlResult.media.images?.length || 0} images, ${crawlResult.media.videos?.length || 0} videos\n`
        }
      } else {
        formattedOutput = `Failed to crawl: ${url}\nError: ${crawlResult.error_message || "Unknown error"}`
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              { mode, url, success: crawlResult.success, result: crawlResult, formattedOutput },
              null,
              2
            ),
          },
        ],
      }
    } else if (mode === "markdown") {
      const markdown = data.markdown || data
      const markdownStr =
        typeof markdown === "string" ? markdown : JSON.stringify(markdown)
      const preview = markdownStr.substring(0, 1000)
      const truncated = markdownStr.length > 1000 ? "..." : ""
      formattedOutput = `Markdown extracted from: ${url}\n\nFilter: ${markdown_filter}\n\n${preview}${truncated}`

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              { mode, url, success: true, result: { markdown: markdownStr }, formattedOutput },
              null,
              2
            ),
          },
        ],
      }
    } else {
      // screenshot
      const screenshot = data.screenshot || data
      const screenshotStr =
        typeof screenshot === "string" ? screenshot : JSON.stringify(screenshot)
      formattedOutput = `Screenshot captured from: ${url}\n\nFormat: Base64 PNG\nSize: ${screenshotStr.length} characters`

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              { mode, url, success: true, result: { screenshot: screenshotStr }, formattedOutput },
              null,
              2
            ),
          },
        ],
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              mode,
              url,
              success: false,
              error: true,
              errorMessage: `Failed to process ${mode} request: ${errorMessage}`,
              formattedOutput: `Error: ${errorMessage}`,
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
