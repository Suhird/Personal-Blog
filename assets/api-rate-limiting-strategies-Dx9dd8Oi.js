const e=`# Rate Limiting Strategies for APIs

Comparing Token Bucket, Leaky Bucket, and Fixed Window algorithms for API rate limiting.


## Algorithms

### 1. Fixed Window
Resets counter every minute.
**Pros**: Simple.
**Cons**: Burst at the edge of the window (e.g. 12:00:59 and 12:01:01).

### 2. Token Bucket
You have a bucket of tokens. Requests take a token. Tokens refill at a constant rate.
**Pros**: Allows bursts but smooths sustained traffic.
**Cons**: slightly more complex state.

### Implementation (Redis)

\`\`\`lua
-- Lua script for Token Bucket in Redis
local key = KEYS[1]
local rate = tonumber(ARGV[1])
local now = tonumber(ARGV[2])

local tokens = tonumber(redis.call("get", key) or rate)
if tokens > 0 then
    redis.call("decr", key)
    return 1 -- Allowed
else
    return 0 -- Rejected
end
\`\`\`


## Conclusion

I hope this gives you a better understanding of System Design. If you enjoyed this post, check out the other articles in this series!
`;export{e as default};
