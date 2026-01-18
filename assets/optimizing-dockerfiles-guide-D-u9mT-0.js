const n=`# Ultimate Guide to Dockerfile Optimization

Techniques to reduce image size, speed up builds, and improve security in your Dockerfiles.


## 1. Multi-Stage Builds

The easiest way to shrink images. Build in a fat container, ship in a lean one.

\`\`\`dockerfile
# Build Stage
FROM golang:1.21 AS builder
WORKDIR /app
COPY . .
RUN go build -o myapp main.go

# Run Stage
FROM alpine:3.18
WORKDIR /root/
COPY --from=builder /app/myapp .
CMD ["./myapp"]
\`\`\`

## 2. Order Matters for Caching

Always copy your dependency files (package.json, go.mod) **before** your source code.

\`\`\`dockerfile
# Good
COPY go.mod go.sum ./
RUN go mod download
COPY . .

# Bad
COPY . .
RUN go mod download
\`\`\`


## Conclusion

I hope this gives you a better understanding of Docker. If you enjoyed this post, check out the other articles in this series!
`;export{n as default};
