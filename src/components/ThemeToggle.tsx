import { Moon, Sun, Palette } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon"
          className="relative border-terminal-cyan/50 text-terminal-cyan hover:bg-terminal-cyan/10 hover:border-terminal-cyan hover:text-terminal-cyan transition-all shadow-[0_0_8px_rgba(6,182,212,0.2)]"
        >
          <Palette className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all drop-shadow-md" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("catppuccin-mocha")}>
          Catppuccin Mocha (Default)
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => setTheme("catppuccin-frappe")}>
          Catppuccin Frappé
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("catppuccin-macchiato")}>
          Catppuccin Macchiato
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dracula")}>
            Dracula
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("rose-pine")}>
            Rosé Pine
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
