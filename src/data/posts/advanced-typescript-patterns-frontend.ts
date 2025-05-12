
import { BlogPost } from "@/components/BlogCard";

export const post: BlogPost = {
  id: "5",
  title: "Advanced TypeScript Patterns for Frontend Developers",
  description: "Explore advanced TypeScript patterns and techniques to improve your frontend codebase.",
  date: "March 20, 2025",
  tags: ["TypeScript", "Frontend", "Best Practices"],
  readTime: "9 min",
  slug: "advanced-typescript-patterns-frontend",
  content: `
# Advanced TypeScript Patterns for Frontend Developers

TypeScript has become the standard for large-scale frontend development. This article explores advanced patterns that can help you write more robust and maintainable code.

## Discriminated Unions

Discriminated unions (or tagged unions) are a powerful pattern for modeling state:

\`\`\`typescript
// Basic approach
type State = {
  loading: boolean;
  data: Data | null;
  error: Error | null;
};

// Better approach with discriminated union
type State = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: Data }
  | { status: 'error'; error: Error };

// Usage
function renderUI(state: State) {
  switch(state.status) {
    case 'idle':
      return <Idle />;
    case 'loading':
      return <LoadingSpinner />;
    case 'success':
      return <DataView data={state.data} />; // TypeScript knows data exists
    case 'error':
      return <ErrorMessage error={state.error} />; // TypeScript knows error exists
  }
}
\`\`\`

## Template Literal Types

TypeScript 4.1+ introduced template literal types for powerful string manipulation:

\`\`\`typescript
type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
type Endpoint = '/users' | '/posts' | '/comments';

// Combining them with template literals
type APIRoute = \`\${HTTPMethod} \${Endpoint}\`;
// Results in: 'GET /users' | 'GET /posts' | ... etc.

function fetchAPI(route: APIRoute) {
  // Implementation
}

fetchAPI('GET /users'); // Valid
fetchAPI('PATCH /users'); // Error! 'PATCH' is not in HTTPMethod
\`\`\`

## The Builder Pattern

The builder pattern creates complex objects step by step:

\`\`\`typescript
class RequestBuilder {
  private url: string = '';
  private method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET';
  private headers: Record<string, string> = {};
  private body: unknown;

  setUrl(url: string): this {
    this.url = url;
    return this;
  }

  setMethod(method: 'GET' | 'POST' | 'PUT' | 'DELETE'): this {
    this.method = method;
    return this;
  }

  setHeader(key: string, value: string): this {
    this.headers[key] = value;
    return this;
  }

  setBody<T>(body: T): this {
    this.body = body;
    return this;
  }

  build(): Request {
    return {
      url: this.url,
      method: this.method,
      headers: this.headers,
      body: this.body,
    };
  }
}

// Usage
const request = new RequestBuilder()
  .setUrl('https://api.example.com/users')
  .setMethod('POST')
  .setHeader('Content-Type', 'application/json')
  .setBody({ name: 'John Doe' })
  .build();
\`\`\`

## Utility Types

TypeScript provides powerful utility types for type transformations:

\`\`\`typescript
interface User {
  id: number;
  name: string;
  email: string;
  password: string;
}

// Creating a type without sensitive fields
type PublicUser = Omit<User, 'password'>;

// Creating a read-only version
type ImmutableUser = Readonly<User>;

// Creating a partial version where all fields are optional
type PartialUser = Partial<User>;

// Extract only specific properties
type UserCredentials = Pick<User, 'email' | 'password'>;
\`\`\`

## Generic Constraints

Constrain generic types to ensure they have specific properties:

\`\`\`typescript
// T must be an object with an id property
function findById<T extends { id: string }>(items: T[], id: string): T | undefined {
  return items.find(item => item.id === id);
}

// Usage
const users = [
  { id: '1', name: 'Alice' },
  { id: '2', name: 'Bob' }
];

const user = findById(users, '1'); // Works
const numbers = [1, 2, 3];
const number = findById(numbers, '1'); // Error! number[] is not assignable to { id: string }[]
\`\`\`

## Conclusion

These advanced TypeScript patterns can significantly improve the quality and maintainability of your frontend codebase. By leveraging TypeScript's type system fully, you can catch more bugs at compile time and write self-documenting code that's easier to refactor and maintain.
`
};
