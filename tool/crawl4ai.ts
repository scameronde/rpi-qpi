import { tool } from "@opencode-ai/plugin"

interface CrawlerConfig {
  cache_mode?: "enabled" | "disabled" | "bypass" | "read_only" | "write_only"
  css_selector?: string
  word_count_threshold?: number
  excluded_tags?: string[]
  only_text?: boolean
}

interface BrowserConfig {
  headless?: boolean
  user_agent?: string
  viewport_width?: number
  viewport_height?: number
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
  cleaned_html?: string
  media?: {
    images: string[]
    videos: string[]
  }
  metadata?: {
    title?: string
    description?: string
  }
  error_message?: string
}

interface FormattedResponse {
  mode: string
  url: string
  success: boolean
  result: CrawlResult | { markdown: string } | { screenshot: string }
  formattedOutput: string
  error?: boolean
  errorMessage?: string
}

export default tool({
  description: "Extract content from web pages using Crawl4AI service. Supports three modes: crawl (full page extraction), markdown (focused Markdown with filtering), screenshot (page capture as PNG). Works alongside searxng-search for comprehensive web data gathering.",
  args: {
    url: tool.schema
      .string()
      .url()
      .describe("The URL to crawl/extract content from"),
    mode: tool.schema
      .enum(["crawl", "markdown", "screenshot"])
      .optional()
      .describe("Operation mode: crawl (full extraction), markdown (filtered Markdown), screenshot (PNG capture). Default: crawl"),
    cache_mode: tool.schema
      .enum(["enabled", "disabled", "bypass", "read_only", "write_only"])
      .optional()
      .describe("Cache behavior for crawl mode"),
    css_selector: tool.schema
      .string()
      .optional()
      .describe("CSS selector to extract specific content (crawl mode)"),
    word_count_threshold: tool.schema
      .number()
      .int()
      .positive()
      .optional()
      .describe("Minimum word count for content blocks (crawl mode)"),
    markdown_filter: tool.schema
      .enum(["raw", "fit", "bm25", "llm"])
      .optional()
      .describe("Markdown filter type (markdown mode). Default: fit"),
    filter_query: tool.schema
      .string()
      .optional()
      .describe("Query for bm25/llm filters (markdown mode)"),
    screenshot_wait: tool.schema
      .number()
      .positive()
      .optional()
      .describe("Wait time in seconds before screenshot (screenshot mode). Default: 2"),
    headless: tool.schema
      .boolean()
      .optional()
      .describe("Run browser in headless mode. Default: true"),
    user_agent: tool.schema
      .string()
      .optional()
      .describe("Custom user agent string"),
  },
  async execute(args) {
    const {
      url,
      mode = "crawl",
      cache_mode,
      css_selector,
      word_count_threshold,
      markdown_filter = "fit",
      filter_query,
      screenshot_wait = 2,
      headless = true,
      user_agent,
    } = args

    const baseUrl = "http://crawl4ai.vier.services:11235"

    try {
      let endpoint = ""
      let requestBody: CrawlRequest | MarkdownRequest | ScreenshotRequest
      let formattedOutput = ""

      // Build request based on mode
      if (mode === "crawl") {
        endpoint = "/crawl"
        
        const crawler_config: CrawlerConfig = {}
        if (cache_mode) crawler_config.cache_mode = cache_mode
        if (css_selector) crawler_config.css_selector = css_selector
        if (word_count_threshold) crawler_config.word_count_threshold = word_count_threshold

        const browser_config: BrowserConfig = {}
        if (headless !== undefined) browser_config.headless = headless
        if (user_agent) browser_config.user_agent = user_agent

        requestBody = {
          urls: [url],
          crawler_config: Object.keys(crawler_config).length > 0 ? crawler_config : undefined,
          browser_config: Object.keys(browser_config).length > 0 ? browser_config : undefined,
        }
      } else if (mode === "markdown") {
        endpoint = "/md"
        
        requestBody = {
          url,
          f: markdown_filter,
        }
        if (filter_query && (markdown_filter === "bm25" || markdown_filter === "llm")) {
          (requestBody as MarkdownRequest).q = filter_query
        }
      } else if (mode === "screenshot") {
        endpoint = "/screenshot"
        
        requestBody = {
          url,
          screenshot_wait_for: screenshot_wait,
        }
      } else {
        throw new Error(`Invalid mode: ${mode}`)
      }

      const fullUrl = `${baseUrl}${endpoint}`

      // Make the API request
      const response = await fetch(fullUrl, {
        method: "POST",
        headers: {
          "User-Agent": "OpenCode-Crawl4AI-Tool/1.0",
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(requestBody),
        timeout: 30000, // 30 second timeout
      })

      if (!response.ok) {
        throw new Error(
          `Crawl4AI API error: ${response.status} ${response.statusText}`
        )
      }

      const data = await response.json()

      // Format response based on mode
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
            formattedOutput += `\nMarkdown Content:\n${crawlResult.markdown.substring(0, 500)}${crawlResult.markdown.length > 500 ? "..." : ""}\n`
          }
          if (crawlResult.media) {
            formattedOutput += `\nMedia: ${crawlResult.media.images?.length || 0} images, ${crawlResult.media.videos?.length || 0} videos\n`
          }
        } else {
          formattedOutput = `Failed to crawl: ${url}\nError: ${crawlResult.error_message || "Unknown error"}`
        }

        const response_data: FormattedResponse = {
          mode,
          url,
          success: crawlResult.success,
          result: crawlResult,
          formattedOutput,
        }

        return JSON.stringify(response_data, null, 2)
      } else if (mode === "markdown") {
        const markdown = data.markdown || data
        formattedOutput = `Markdown extracted from: ${url}\n\nFilter: ${markdown_filter}\n\n${typeof markdown === "string" ? markdown.substring(0, 1000) : JSON.stringify(markdown).substring(0, 1000)}${(typeof markdown === "string" ? markdown : JSON.stringify(markdown)).length > 1000 ? "..." : ""}`

        const response_data: FormattedResponse = {
          mode,
          url,
          success: true,
          result: { markdown: typeof markdown === "string" ? markdown : JSON.stringify(markdown) },
          formattedOutput,
        }

        return JSON.stringify(response_data, null, 2)
      } else if (mode === "screenshot") {
        const screenshot = data.screenshot || data
        formattedOutput = `Screenshot captured from: ${url}\n\nFormat: Base64 PNG\nSize: ${typeof screenshot === "string" ? screenshot.length : 0} characters`

        const response_data: FormattedResponse = {
          mode,
          url,
          success: true,
          result: { screenshot: typeof screenshot === "string" ? screenshot : JSON.stringify(screenshot) },
          formattedOutput,
        }

        return JSON.stringify(response_data, null, 2)
      }

      throw new Error("Invalid mode reached end of execution")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      return JSON.stringify(
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
      )
    }
  },
})
