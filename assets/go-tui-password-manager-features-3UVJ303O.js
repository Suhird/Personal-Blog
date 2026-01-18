const n=`# Building a Password Manager TUI (Part 3: Interactivity)

Adding real-world features: Fuzzy searching, copying to clipboard, and modal dialogs.


## Copy to Clipboard

A password manager is useless if you have to type the password.

\`\`\`go
import "github.com/atotto/clipboard"

// When user presses 'Enter'
list.SetSelectedFunc(func(i int, mainText string, secondaryText string, shortcut rune) {
    password := GetPassword(mainText) // retrieve from decrypted store
    clipboard.WriteAll(password)
    
    // Show a modal feedback
    modal := tview.NewModal().
        SetText("Password copied to clipboard!").
        AddButtons([]string{"OK"}).
        SetDoneFunc(func(buttonIndex int, buttonLabel string) {
            app.SetRoot(list, true) // Go back to list
        })
        
    app.SetRoot(modal, true)
})
\`\`\`

## Fuzzy Search

To find credentials fast, we add an input field at the bottom.

\`\`\`go
inputField := tview.NewInputField().
    SetLabel("Search: ").
    SetFieldBackgroundColor(ColorBackground).
    SetFieldTextColor(ColorCyan).
    SetChangedFunc(func(text string) {
        // Filter the list items based on 'text'
        filterList(list, text)
    })
\`\`\`

With these three parts, you have a functional, secure, and beautiful terminal application.


## Conclusion

I hope this gives you a better understanding of Go. If you enjoyed this post, check out the other articles in this series!
`;export{n as default};
