const n=`# Building a Financial Portfolio TUI with Python and Textual (Part 2: AI-Powered Analysis)

In [Part 1](/blog/financial-portfolio-tui-part-1), I built the terminal interface — the sidebar file explorer, the holdings tables, the Bloomberg-style amber color scheme. The app looked great, but it was just... displaying data.

That's boring.

I wanted the app to actually *tell me things* about my portfolio. Is my asset allocation reasonable? Am I over-concentrated in one sector? Should I be worried about that tech-heavy TFSA?

So I added AI-powered analysis. Here's how to connect a Python TUI to Claude and Gemini.

## The AI Client Architecture

The cleanest approach is to abstract the AI provider behind a simple interface. Whether you're using Anthropic, Google, or (in the future) a local LLM, the interface stays the same:

\`\`\`python:src/terminal_portfolio/ai_client.py
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv()


@dataclass
class AIAnalysis:
    """Represents an AI-generated portfolio analysis."""
    summary: str
    recommendations: list[str]
    risk_factors: list[str]
    raw_response: str


class AIProvider(ABC):
    """Abstract base class for AI providers."""

    @abstractmethod
    async def analyze(self, prompt: str) -> AIAnalysis:
        """Send a prompt to the AI and get an analysis back."""
        pass


class AnthropicProvider(AIProvider):
    """Anthropic Claude provider."""

    def __init__(self, api_key: Optional[str] = None):
        import anthropic
        self.client = anthropic.Anthropic(api_key=api_key or os.getenv("ANTHROPIC_API_KEY"))

    async def analyze(self, prompt: str) -> AIAnalysis:
        response = self.client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1024,
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        text = response.content[0].text
        return self._parse_response(text)

    def _parse_response(self, text: str) -> AIAnalysis:
        """Parse the AI response into structured fields."""
        sections = {
            "summary": [],
            "recommendations": [],
            "risk_factors": []
        }
        current_section = "summary"

        for line in text.split("\\n"):
            line = line.strip()
            if line.lower().startswith("recommendations:"):
                current_section = "recommendations"
                continue
            elif line.lower().startswith("risk factors:"):
                current_section = "risk_factors"
                continue

            if line:
                sections[current_section].append(line)

        return AIAnalysis(
            summary="\\n".join(sections["summary"]),
            recommendations=sections["recommendations"],
            risk_factors=sections["risk_factors"],
            raw_response=text,
        )


class GeminiProvider(AIProvider):
    """Google Gemini provider."""

    def __init__(self, api_key: Optional[str] = None):
        import google.generativeai as genai
        genai.configure(api_key=api_key or os.getenv("GOOGLE_API_KEY"))
        self.model = genai.GenerativeModel("gemini-2.0-flash")

    async def analyze(self, prompt: str) -> AIAnalysis:
        response = await self.model.generate_content_async(prompt)

        return self._parse_response(response.text)

    def _parse_response(self, text: str) -> AIAnalysis:
        """Parse the AI response into structured fields."""
        sections = {
            "summary": [],
            "recommendations": [],
            "risk_factors": []
        }
        current_section = "summary"

        for line in text.split("\\n"):
            line = line.strip()
            if line.lower().startswith("recommendations:"):
                current_section = "recommendations"
                continue
            elif line.lower().startswith("risk factors:"):
                current_section = "risk_factors"
                continue

            if line:
                sections[current_section].append(line)

        return AIAnalysis(
            summary="\\n".join(sections["summary"]),
            recommendations=sections["recommendations"],
            risk_factors=sections["risk_factors"],
            raw_response=text,
        )


class AIClient:
    """Main AI client that selects provider based on available API keys."""

    def __init__(self):
        self.provider: Optional[AIProvider] = None
        self._setup_provider()

    def _setup_provider(self) -> None:
        """Set up the first available provider."""
        anthropic_key = os.getenv("ANTHROPIC_API_KEY")
        gemini_key = os.getenv("GOOGLE_API_KEY")

        if anthropic_key:
            self.provider = AnthropicProvider(anthropic_key)
        elif gemini_key:
            self.provider = GeminiProvider(gemini_key)
        else:
            raise ValueError("No AI API key found. Set ANTHROPIC_API_KEY or GOOGLE_API_KEY")

    async def analyze_portfolio(self, portfolio) -> str:
        """Generate an AI analysis of a portfolio."""
        prompt = self._build_prompt(portfolio)

        if not self.provider:
            return "No AI provider configured"

        analysis = await self.provider.analyze(prompt)
        return analysis.raw_response

    def _build_prompt(self, portfolio) -> str:
        """Build a detailed prompt from portfolio data."""
        holdings_text = "\\n".join([
            f"- {h.symbol}: {h.quantity} shares @ \${h.price:.2f} "
            f"(Value: \${h.value:.2f}, Gain/Loss: \${h.gain_loss:.2f} / {h.gain_loss_percent:+.2f}%)"
            for h in portfolio.holdings
        ])

        prompt = f"""You are a financial advisor analyzing an investment portfolio.

PORTFOLIO SUMMARY:
- Total Value: \${portfolio.total_value:,.2f}
- Total Gain/Loss: \${portfolio.total_gain_loss:,.2f} ({portfolio.total_gain_loss_percent:+.2f}%)
- Number of Holdings: {len(portfolio.holdings)}

HOLDINGS:
{holdings_text}

Provide a concise analysis with:
1. A brief summary of the portfolio's current state
2. Key recommendations for rebalancing or optimization
3. Potential risk factors to consider

Format your response clearly with sections."""

        return prompt
\`\`\`

## Building the Prompt

The key to good AI analysis is a well-structured prompt. My prompt includes:

1. **Portfolio summary** — Total value, gains/losses, number of holdings
2. **Detailed holdings list** — Each holding with quantity, price, value, and gain/loss
3. **Clear instructions** — What format I want the response in

Here's the prompt I use:

\`\`\`python:prompt_builder.py
prompt = f"""You are a financial advisor analyzing an investment portfolio.

PORTFOLIO SUMMARY:
- Total Value: \${portfolio.total_value:,.2f}
- Total Gain/Loss: \${portfolio.total_gain_loss:,.2f} ({portfolio.total_gain_loss_percent:+.2f}%)
- Number of Holdings: {len(portfolio.holdings)}

HOLDINGS:
{holdings_text}

Provide a concise analysis with:
1. A brief summary of the portfolio's current state
2. Key recommendations for rebalancing or optimization
3. Potential risk factors to consider

Format your response clearly with sections."""
\`\`\`

## Displaying the Analysis

Now I need to wire this into the Textual app. The AI call is async, so Textual's \`run_worker\` is perfect:

\`\`\`python:main.py
from textual.app import App, ComposeResult
from textual.worker import Worker
from textual.widgets import Static, LoadingIndicator
from textual.binding import Binding


class TerminalPortfolio(App):
    BINDINGS = [
        Binding("a", "trigger_ai_review", "AI Review"),
        Binding("q", "quit", "Quit"),
    ]

    def __init__(self):
        super().__init__()
        self.ai_client = AIClient()

    async def action_trigger_ai_review(self) -> None:
        """Generate AI analysis of current portfolio."""
        if not self.active_portfolio:
            self.notify("No portfolio loaded", severity="warning")
            return

        # Show loading indicator
        review = self.query_one("#review-text", Static)
        review.update("🤖 Generating AI analysis...")

        # Run the AI call in a worker to keep UI responsive
        async def get_analysis():
            return await self.ai_client.analyze_portfolio(self.active_portfolio)

        worker = self.run_worker(get_analysis, exit_on_error=False)

    def on_worker_complete(self, event: Worker.Completed[AIAnalysis]) -> None:
        """Handle AI analysis completion."""
        review = self.query_one("#review-text", Static)
        review.update(f"💬\\n\\n{event.result}")
\`\`\`

## Search Functionality

One thing I really wanted was the ability to search within the AI review. Sometimes the analysis is long, and I just want to find the part about tech stocks.

Textual has a built-in search mechanism. Here's how I added it:

\`\`\`python:search_feature.py
class TerminalPortfolio(App):
    BINDINGS = [
        Binding("a", "trigger_ai_review", "AI Review"),
        Binding("/", "focus_search", "Search"),
        Binding("q", "quit", "Quit"),
    ]

    async def action_focus_search(self) -> None:
        """Focus the search input."""
        search_input = self.query_one("#search-input", TextArea)
        search_input.focus()

    def on_text_area_changed(self, event: TextArea.Changed) -> None:
        """Handle search input changes."""
        query = event.text_area.text.lower()
        if not query:
            return

        # Highlight matching text in the review
        review = self.query_one("#review-text", Static)
        text = self.current_analysis

        if query.lower() in text.lower():
            # Find and highlight the match
            start = text.lower().find(query.lower())
            end = start + len(query)
            highlighted = (
                text[:start]
                + f"[reverse]{text[start:end]}[/reverse]"
                + text[end:]
            )
            review.update(highlighted)
\`\`\`

## Environment Setup

Don't hardcode API keys. Use \`.env\`:

\`\`\`bash:.env.example
ANTHROPIC_API_KEY=sk-ant-...
# Or
GOOGLE_API_KEY=AIza...
\`\`\`

Load it at startup:

\`\`\`python:setup.py
from dotenv import load_dotenv

load_dotenv()  # Load .env file

ai_client = AIClient()  # Will pick up API key from env
\`\`\`

## The Final Result

Here's what the AI review looks like in action:

\`\`\`
💬 AI PORTFOLIO ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SUMMARY:
Your portfolio is well-diversified across 8 holdings with a
total value of $45,232.50. The overall gain of $2,847.20 (6.7%)
indicates healthy performance.

RECOMMENDATIONS:
- Consider reducing AAPL concentration (currently 22% of portfolio)
- Your tech sector exposure is high at 45%
- TFSA has no bonds; consider adding some fixed income

RISK FACTORS:
- High concentration in individual tech stocks
- No international diversification
- REET allocation may be too small for optimal diversification
\`\`\`

## What's Next?

The app is functional, but there's room for improvement:

1. **Local LLMs** — Using APIs is convenient but costs money and has latency. Local models via Ollama would be faster and free.
2. **News Integration** — Pull financial news from Yahoo Finance and use it as context for the AI analysis.
3. **Vector DB** — Store past analyses so you can compare portfolio health over time.
4. **RAG Pipeline** — Use retrieval-augmented generation to provide the AI with recent market context.

The code is on GitHub if you want to play with it. Happy investing (responsibly).

![Financial Portfolio TUI Screenshot](/financial-portfolio-tui-screenshot.jpeg)
`;export{n as default};
