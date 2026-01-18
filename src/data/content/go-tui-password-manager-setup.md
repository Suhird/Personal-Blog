# Building a Password Manager TUI (Part 1: UI & K9s Style)

Setting up a professional Terminal User Interface in Go using TView, styled with the vibrant K9s color scheme.


## Why TUI?

Terminal UIs are blazing fast and perfect for sensitive tools like password managers. We will build **Gopass**, a secure local password manager.

### The Stack

- **Tnterface**: [tview](https://github.com/rivo/tview) (Layouts)
- **Engine**: [tcell](https://github.com/gdamore/tcell) (Events)
- **Style**: **K9s Theme** (It just looks better).

### K9s-Style Theme Setup

K9s is famous for its Hot Pink and Cyan aesthetics. Let's replicate that vibe.

```go
package main

import (
	"github.com/gdamore/tcell/v2"
	"github.com/rivo/tview"
)

// K9s-inspired Color Palette
var (
	ColorBackground = tcell.NewHexColor(0x161616) // Dark Gray
	ColorText       = tcell.NewHexColor(0xeceff4) // White-ish
	ColorPink       = tcell.NewHexColor(0xff007c) // K9s Hot Pink
	ColorCyan       = tcell.NewHexColor(0x00d7d7) // Cyan
)

func main() {
	app := tview.NewApplication()

	// List items with our custom colors
	list := tview.NewList().
		AddItem("Amazon", "user@example.com", 'a', nil).
		AddItem("GitHub", "dev@example.com", 'g', nil).
		SetMainTextColor(ColorText).
		SetSelectedTextColor(ColorBackground).
		SetSelectedBackgroundColor(ColorPink). // Hot Pink highlight!
		SetBackgroundColor(ColorBackground)

	// A Cyan Border
	list.SetBorder(true).
		SetBorderColor(ColorCyan).
		SetTitle("[ Password Manager ]").
		SetTitleColor(ColorPink)

	if err := app.SetRoot(list, true).Run(); err != nil {
		panic(err)
	}
}
```

This gives us that distinct, professional hacker look immediately.


## Conclusion

I hope this gives you a better understanding of Go. If you enjoyed this post, check out the other articles in this series!
