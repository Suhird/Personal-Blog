const n=`# Building a Financial Portfolio TUI with Python and Textual (Part 1: The Terminal Interface)

I recently started investing — nothing fancy, just the usual index funds through Wealthsimple. RRSP here, TFSA there, a personal account for day trading (read: gambling with meme stocks). Point is, I had money scattered across multiple accounts and no good way to see the full picture.

Wealthsimple gives you CSVs. Your bank gives you CSVs. Every brokerage platform has its own format. I wanted something that could:
1. Load multiple CSV files from different accounts
2. Show me everything in one view
3. Actually look good — not some sad green-on-black terminal

And because I'm a developer and can't resist over-engineering things, I added AI-powered portfolio analysis because why not?

Here's how I built it.

## The Stack

- **Python** — Fast enough for CSV parsing, and the \`textual\` library is genuinely excellent for TUIs
- **Textual** — The TUI framework that actually feels modern. Think Rich + a full app framework
- **Wealthsimple CSV** — The data format I'm working with
- **Anthropic Claude / Google Gemini** — For the AI analysis piece

The result is a Bloomberg-terminal inspired interface with an amber-on-black color scheme that looks like actual professional software.

## Project Structure

\`\`\`
financial-portfolio-tui/
├── main.py              # Entry point
├── src/
│   └── terminal_portfolio/
│       ├── __init__.py
│       ├── portfolio.py    # Portfolio data models
│       ├── csv_loader.py   # CSV parsing
│       ├── ai_client.py    # AI integration
│       └── widgets.py      # Custom Textual widgets
├── data/               # Your CSV files go here
└── .env                # API keys
\`\`\`

## Setting Up the Project

First, create the project with uv (because we're not animals):

\`\`\`bash
mkdir financial-portfolio-tui && cd financial-portfolio-tui
uv init
\`\`\`

Add the dependencies:

\`\`\`toml
[project]
name = "terminal-portfolio"
version = "0.1.0"
requires-python = ">=3.11"
dependencies = [
    "textual>=0.50.0",
    "rich>=13.0.0",
    "anthropic>=0.18.0",
    "python-dotenv>=1.0.0",
]

[tool.uv]
dev-dependencies = []
\`\`\`

\`\`\`bash
uv sync
\`\`\`

## The Main Application

Textual apps are classes. Here's my main app structure:

\`\`\`python
# main.py
import os
from textual.app import App, ComposeResult
from textual.driver import Driver
from textual.widgets import Header, Footer, Static, Tree
from textual.containers import Container, Horizontal, Vertical
from textual.binding import Binding

from src.terminal_portfolio.portfolio import Portfolio
from src.terminal_portfolio.csv_loader import CSVLoader
from src.terminal_portfolio.ai_client import AIClient


class TerminalPortfolio(App):
    """Bloomberg-style terminal UI for portfolio analysis."""

    CSS = """
    Screen {
        background: #1a1a1a;
    }

    #sidebar {
        width: 28;
        background: #0d0d0d;
        border-right: solid #3d3d3d;
    }

    #main {
        width: 100%;
    }

    #header-bar {
        height: 3;
        background: #0d0d0d;
        border-bottom: solid #3d3d3d;
        dock: top;
    }

    #content-area {
        width: 100%;
    }

    .data-table {
        height: 100%;
        border: solid #3d3d3d;
        margin: 1 1;
    }

    .table-header {
        background: #2d2d2d;
        color: #ffb000;
        text-style: bold;
    }

    #ai-review {
        width: 100%;
        border-top: solid #3d3d3d;
        height: 40%;
    }

    #review-text {
        color: #e0e0e0;
        padding: 1 2;
    }
    """

    BINDINGS = [
        Binding("a", "trigger_ai_review", "AI Review"),
        Binding("/", "focus_search", "Search"),
        Binding("q", "quit", "Quit"),
    ]

    def __init__(self):
        super().__init__()
        self.portfolios: dict[str, Portfolio] = {}
        self.current_file = ""
        self.ai_client = AIClient()

    def compose(self) -> ComposeResult:
        yield Header()

        with Horizontal():
            with Vertical(id="sidebar"):
                yield Static("📁 FILES", classes="sidebar-header")
                yield Tree(id="file-tree")

            with Vertical(id="main"):
                yield Static("📊 PORTFOLIO OVERVIEW", id="header-bar")
                with Horizontal(id="content-area"):
                    yield Static("Select a CSV file to view holdings", id="placeholder")
                yield Vertical(id="ai-review")
                yield Static("💬 AI ANALYSIS", classes="section-header")
                yield Static("Press [b]a[/b] to generate AI review", id="review-text")

        yield Footer()

    def on_mount(self) -> None:
        """Set up the app on mount."""
        tree = self.query_one("#file-tree", Tree)
        self.populate_file_tree(tree)

    def populate_file_tree(self, tree: Tree) -> None:
        """Populate the sidebar with CSV files."""
        data_path = Path("data")
        if not data_path.exists():
            data_path.mkdir(exist_ok=True)

        root = tree.root
        for file_path in data_path.glob("*.csv"):
            root.add(file_path.stem, data={"path": str(file_path)})
\`\`\`

## The Portfolio Model

Now for the data layer. I need to represent holdings across multiple accounts:

\`\`\`python
# src/terminal_portfolio/portfolio.py
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional


@dataclass
class Holding:
    """Represents a single holding in a portfolio."""
    symbol: str
    name: str
    quantity: float
    price: float
    value: float
    gain_loss: float
    gain_loss_percent: float
    account: str


@dataclass
class Portfolio:
    """Represents a complete portfolio with holdings from multiple accounts."""
    name: str
    holdings: list[Holding] = field(default_factory=list)
    total_value: float = 0.0
    total_gain_loss: float = 0.0
    total_gain_loss_percent: float = 0.0
    last_updated: Optional[datetime] = None

    def add_holding(self, holding: Holding) -> None:
        self.holdings.append(holding)
        self.recalculate()

    def recalculate(self) -> None:
        self.total_value = sum(h.value for h in self.holdings)
        self.total_gain_loss = sum(h.gain_loss for h in self.holdings)
        if self.total_value > 0:
            self.total_gain_loss_percent = (self.total_gain_loss / (self.total_value - self.total_gain_loss)) * 100
        self.last_updated = datetime.now()

    def get_summary(self) -> dict:
        """Get a summary of the portfolio."""
        return {
            "total_value": self.total_value,
            "total_gain_loss": self.total_gain_loss,
            "total_gain_loss_percent": self.total_gain_loss_percent,
            "holdings_count": len(self.holdings),
        }
\`\`\`

## CSV Loading

Wealthsimple exports look like this (simplified):

\`\`\`csv
Symbol,Name,Quantity,Price,Previous Close,Current Value,Gain ($),Gain (%),Account
VFIAX,VANGUARD 500 INDEX ADV,10.5,425.50,420.00,4467.75,57.75,1.31%,RRSP
AAPL,APPLE INC,5,178.25,175.50,891.25,13.75,0.78%,TFSA
\`\`\`

Here's my CSV loader:

\`\`\`python
# src/terminal_portfolio/csv_loader.py
from pathlib import Path
from typing import Iterator
from src.terminal_portfolio.portfolio import Portfolio, Holding


class CSVLoader:
    """Loads and parses Wealthsimple CSV exports."""

    def load(self, file_path: str | Path) -> Portfolio:
        """Load a CSV file and return a Portfolio object."""
        path = Path(file_path)
        portfolio = Portfolio(name=path.stem)

        with open(path, "r") as f:
            lines = f.readlines()

        # Skip header row
        for line in lines[1:]:
            holding = self._parse_line(line, path.stem)
            if holding:
                portfolio.add_holding(holding)

        return portfolio

    def _parse_line(self, line: str, account: str) -> Holding | None:
        """Parse a single CSV line into a Holding."""
        parts = [p.strip() for p in line.split(",")]

        if len(parts) < 8:
            return None

        try:
            # Extract account from the last column (remove % if present)
            # Note: Wealthsimple includes account in the CSV
            holding_account = parts[7].rstrip("%").strip() if len(parts) > 7 else account

            return Holding(
                symbol=parts[0],
                name=parts[1],
                quantity=float(parts[2]),
                price=float(parts[3]),
                value=float(parts[5]),
                gain_loss=float(parts[6]),
                gain_loss_percent=float(parts[7].rstrip("%")),
                account=holding_account,
            )
        except (ValueError, IndexError):
            return None
\`\`\`

## Building Custom Widgets

Textual's strength is its widget composition. Here's a custom table widget for displaying holdings:

\`\`\`python
# src/terminal_portfolio/widgets.py
from textual.widgets import Static, DataTable
from textual.containers import Vertical
from textual.message import Message
from typing import Optional

from src.terminal_portfolio.portfolio import Portfolio, Holding


class HoldingsTable(DataTable):
    """Custom table for displaying portfolio holdings."""

    class RowSelected(Message):
        def __init__(self, holding: Holding) -> None:
            self.holding = holding
            super().__init__()

    def __init__(self, portfolio: Optional[Portfolio] = None):
        super().__init__()
        self.portfolio = portfolio

    def compose(self):
        yield from super().compose()

    def load_portfolio(self, portfolio: Portfolio) -> None:
        """Load a portfolio and display its holdings."""
        self.clear()
        self.portfolio = portfolio

        # Define columns
        self.add_columns(
            ("SYMBOL", "symbol", "w12"),
            ("NAME", "name", "w20"),
            ("QTY", "quantity", "w8"),
            ("PRICE", "price", "w10"),
            ("VALUE", "value", "w12"),
            ("GAIN/LOSS", "gain_loss", "w12"),
            ("GAIN %", "gain_percent", "w8"),
            ("ACCOUNT", "account", "w10"),
        )

        # Color code based on gain/loss
        for holding in portfolio.holdings:
            gain_color = "#00ff00" if holding.gain_loss >= 0 else "#ff4444"
            self.add_row(
                holding.symbol,
                holding.name[:20],  # Truncate long names
                f"{holding.quantity:.2f}",
                f"\${holding.price:.2f}",
                f"\${holding.value:,.2f}",
                f"\${holding.gain_loss:,.2f}",
                f"{holding.gain_loss_percent:+.2f}%",
                holding.account,
                style=gain_color,
            )
\`\`\`

## The Final Result

Here's the complete main.py bringing it all together:

\`\`\`python
# main.py
from pathlib import Path
from textual.app import App, ComposeResult
from textual.binding import Binding
from textual.events import Key
from textual.widgets import Static

from src.terminal_portfolio.portfolio import Portfolio
from src.terminal_portfolio.csv_loader import CSVLoader
from src.terminal_portfolio.ai_client import AIClient
from src.terminal_portfolio.widgets import HoldingsTable


class TerminalPortfolio(App):
    CSS = """
    Screen { background: #1a1a1a; }
    #sidebar { width: 28; background: #0d0d0d; border-right: solid #3d3d3d; }
    #main { width: 100%; }
    .section-header { color: #ffb000; text-style: bold; padding: 0 1; }
    .positive { color: #00ff00; }
    .negative { color: #ff4444; }
    """

    BINDINGS = [
        Binding("a", "trigger_ai_review", "AI Review"),
        Binding("q", "quit", "Quit"),
    ]

    def __init__(self):
        super().__init__()
        self.portfolios: dict[str, Portfolio] = {}
        self.active_holdings_table = None
        self.csv_loader = CSVLoader()
        self.ai_client = AIClient()

    def compose(self) -> ComposeResult:
        yield from super().compose()

        with self.container.vertical():
            yield Static("📊 TERMINAL PORTFOLIO", classes="section-header")

            # Stacked holdings tables
            with self.container.horizontal():
                yield Static("Select CSV from sidebar", id="placeholder")

    def on_tree_file_selected(self, event: Tree.FileSelected) -> None:
        """Handle file selection from sidebar."""
        path = event.path
        portfolio = self.csv_loader.load(path)
        self.portfolios[path] = portfolio
        self.display_holdings(portfolio)

    def display_holdings(self, portfolio: Portfolio) -> None:
        """Display holdings in a formatted table."""
        table = HoldingsTable(portfolio)
        table.load_portfolio(portfolio)

        placeholder = self.query_one("#placeholder")
        placeholder.remove()
        self.container.mount(table)

        self.active_holdings_table = table

    async def action_trigger_ai_review(self) -> None:
        """Generate AI analysis of current portfolio."""
        if not self.active_holdings_table:
            return

        review_text = self.query_one("#review-text")
        review_text.update("🤖 Generating analysis...")

        portfolio = self.active_holdings_table.portfolio
        analysis = await self.ai_client.analyze_portfolio(portfolio)

        review_text.update(f"💬 {analysis}")


if __name__ == "__main__":
    app = TerminalPortfolio()
    app.run()
\`\`\`

In the next post, I'll cover the AI integration — connecting to Claude/Gemini and building the analysis pipeline. Stay tuned.
`;export{n as default};
