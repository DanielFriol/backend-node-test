## Project Overview

This is my implementation of the **Candidate Interview Project: Node**.  
I completed all the required and most of the bonus tasks, except for the last one. Unfortunately, I didn’t have much extra time to explore and add more features.

## Technical Choices

I decided to build a **REST API** using **Prisma** because these are technologies I’ve worked with before, so I felt more comfortable and confident using them.  
I structured the project following the **Controller-Service-Repository** pattern to keep the codebase clean, simple, and easy to understand.  
I chose this approach because it’s something I’ve used before and it fits well for a project of this size and scope.

## Caching

Caching was one of the trickier parts to implement.  
I wanted to avoid clearing the entire cache every time a write operation occurred, but I also didn’t want to risk serving stale (eventually consistent) data.  

The solution I came up with was to create a **custom CacheService** (integrated with `@nestjs/cache-manager`) that keeps track of cached keys and selectively clears them whenever a write operation happens.  
This approach gave me more control and consistency over cache behavior.  
That said, I’m aware there’s probably a more elegant or scalable way to handle this, especially for larger systems — but given the project scope, this solution worked well.

## Rate Limiting

Rate limiting also required some thought.  
In a real-world scenario — for example, an application running on Kubernetes with multiple replicas — rate limiting would ideally be handled at the **API Gateway or Load Balancer** level, since each replica would have its own in-memory limit counters.  

For this project, though, I used the `@nestjs/throttler` package and implemented a **global rate limit of 10 requests per minute**.  

I added a few exceptions:
- The **list endpoint** (`GET /pokemons`) has a higher limit of **20 requests per minute**, since it’s a common operation.
- The **import endpoint** (`POST /pokemons/:id`) has a stricter limit of **5 requests per minute**, because it integrates with an external API (PokeAPI), and it’s better to limit usage on our side before hitting external rate limits.

## Final Thoughts

Aside from caching and rate limiting, the rest of the implementation went smoothly.  
I believe I was able to fulfill the main requirements of the test and deliver a well-structured and functional solution within the given time.


## Installation

```bash
$ npm install
or
$ yarn
```

## (Optional) generate prisma files

```bash
$ npm run prisma generate
or
$ yarn prisma generate

```

## Running the app

```bash
$ npm run start:dev
or
$ yarn start:dev
```

## Test

```bash
$ npm run test
or
$ yarn test
```
