const n=`## Building a Simple Deck of Cards Program in Rust 🂡

Rust is known for its speed and safety, but it's also a great language for learning programming concepts like data structures and ownership. In this blog post, we’ll build a simple **deck of cards program** in Rust. It will help you understand enums, structs, vectors, and how to work with randomness.

### 🧱 Step 1: Define the Card Structure

To represent a card, we’ll need to define two enums: one for suits and one for values.

\`\`\`rust enum.rs
#[derive(Debug, Clone)]
enum Suit {
    Hearts,
    Diamonds,
    Clubs,
    Spades,
}

#[derive(Debug, Clone)]
enum Value {
    Two,
    Three,
    Four,
    Five,
    Six,
    Seven,
    Eight,
    Nine,
    Ten,
    Jack,
    Queen,
    King,
    Ace,
}

#[derive(Debug, Clone)]
struct Card {
    suit: Suit,
    value: Value,
}
\`\`\`

We derive \`Debug\` so we can print the cards, and \`Clone\` to easily duplicate cards later (like during a shuffle).

### 🃏 Step 2: Create a Deck of Cards

Let’s write a function to generate a standard 52-card deck.

\`\`\`rust
fn create_deck() -> Vec<Card> {
    let suits = vec![Suit::Hearts, Suit::Diamonds, Suit::Clubs, Suit::Spades];
    let values = vec![
        Value::Two, Value::Three, Value::Four, Value::Five, Value::Six,
        Value::Seven, Value::Eight, Value::Nine, Value::Ten,
        Value::Jack, Value::Queen, Value::King, Value::Ace,
    ];

    let mut deck = Vec::new();
    for suit in &suits {
        for value in &values {
            deck.push(Card {
                suit: suit.clone(),
                value: value.clone(),
            });
        }
    }

    deck
}
\`\`\`

### 🔀 Step 3: Shuffle the Deck

Rust's \`rand\` crate helps us shuffle the deck.

Add this to your \`Cargo.toml\`:

\`\`\`toml
[dependencies]
rand = "0.8"
\`\`\`

Then use \`rand::seq::SliceRandom\` to shuffle.

\`\`\`rust
use rand::seq::SliceRandom;
use rand::thread_rng;

fn shuffle_deck(deck: &mut Vec<Card>) {
    let mut rng = thread_rng();
    deck.shuffle(&mut rng);
}
\`\`\`

### 🃎 Step 4: Draw a Card

We can simulate drawing a card by popping it off the top of the deck.

\`\`\`rust
fn draw_card(deck: &mut Vec<Card>) -> Option<Card> {
    deck.pop()
}
\`\`\`

This returns an \`Option<Card>\`, which is \`Some(card)\` if a card exists, or \`None\` if the deck is empty.

### 🧪 Step 5: Putting It All Together

Now let's build a simple \`main\` function to test everything.

\`\`\`rust
fn main() {
    let mut deck = create_deck();
    println!("Created a deck of {} cards.", deck.len());

    shuffle_deck(&mut deck);
    println!("Deck shuffled!");

    for _ in 0..5 {
        match draw_card(&mut deck) {
            Some(card) => println!("Drew a {:?} of {:?}", card.value, card.suit),
            None => println!("No more cards to draw."),
        }
    }

    println!("{} cards remaining in deck.", deck.len());
}
\`\`\`

### ✅ Output Example

\`\`\`bash
Created a deck of 52 cards.
Deck shuffled!
Drew a Seven of Clubs
Drew an Ace of Hearts
Drew a Queen of Spades
Drew a Three of Diamonds
Drew a Ten of Clubs
47 cards remaining in deck.
\`\`\`

### 🎓 What You Learned

- How to use \`enum\` and \`struct\` to model real-world data
- How to use \`Vec<T>\` as a resizable container
- How to use the \`rand\` crate to shuffle a vector
- How to handle optional values with \`Option<T>\`

### 🚀 Next Steps

Here are some ideas to expand the program:

- Implement multiple players and deal hands
- Add functionality to reset or reshuffle the deck
- Create a game like War or Blackjack

---

Rust might seem strict at first, but as you build small projects like this, the rules start to make sense. Keep practicing, and have fun building!

Happy coding! 🦀
`;export{n as default};
