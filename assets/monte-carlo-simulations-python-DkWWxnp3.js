const n=`# Monte Carlo Simulations in Python

Building a portfolio simulation tool using Monte Carlo methods to estimate financial risk.


## What is Monte Carlo?

It is running a simulation thousands of times with random variables to predict a probability distribution of outcomes.

### Project: Stock Portfolio Simulator

We assume daily returns follow a normal distribution.

\`\`\`python
import numpy as np

def simulate_portfolio(start_price, days, runs):
    mu = 0.001  # daily return
    sigma = 0.02 # daily volatility
    
    # Generate random variances
    dt = np.random.normal(mu, sigma, (days, runs))
    
    # Calculate price paths
    price_paths = start_price * np.exp(np.cumsum(dt, axis=0))
    return price_paths

paths = simulate_portfolio(100, 252, 1000)
# 'paths' now contains 1000 potential future realities for this stock
\`\`\`


## Conclusion

I hope this gives you a better understanding of Python. If you enjoyed this post, check out the other articles in this series!
`;export{n as default};
