# Markdown DB

This paper describes a database model based on a markdown document and an embedded LLM query executor.

## Advantages

- **Simplicity**: The entire database is stored in a single markdown document and can be easily read/edited by a human or an LLM.
- **Powerful structure**: Markdown provides a semantic and hierarchical structure for data, allowing an LLM to work with it efficiently.

## Information Retrieval Algorithm

### Terminology

- **Document element**: A section preview or any markdown block element except a heading. Each element has an id and, if it is a preview, a full length.

### Input

A natural-language query for searching information in the DB.

### Steps

1. **Expand one level**

The document is expanded by one nesting level. At the new level, previews of blocks/sections are shown; higher levels remain fully expanded.

2. **Relevance scoring**

The LLM receives the document expanded to level `n` and the user's query. Each element is assigned a `low`/`medium`/`high` score based on the probability of containing the needed information.

3. **Prune irrelevant elements**

Elements scored `low` are removed and are no longer considered.

4. **Repeat the cycle**

Steps 1-3 are repeated while there are still unexpanded elements.

5. **Final result**

When there is nothing left to expand, the remaining elements are returned as relevant context. If no elements remain, the document contains no relevant information.

### Full walkthrough example

Assume the DB document looks like this:

```
H1
blockquote_1
H2
paragraph_1
H2
paragraph_2
H1
paragraph_3
```

**Iteration 1**

Expansion:
```md
H1
<!-- id: <h1_1>, length: <section length> -->
H1
<!-- id: <h1_2>, length: <section length> -->
```
Scoring:
```txt
h1_1: high
h1_2: low
```
Pruning:
```md
H1
<!-- id: <h1_1>, length: <section length> -->
```

**Iteration 2**

Expansion:
```md
H1
blockquote_1_preview...
<!-- id: <blockquote_1>, length: <block length> -->
H2
<!-- id: <h2_1>, length: <section length> -->
H2
<!-- id: <h2_2>, length: <section length> -->
```
Scoring:
```txt
blockquote_1: low
h2_1: high
h2_2: medium
```
Pruning:
```md
H1
H2
<!-- id: <h2_1>, length: <section length> -->
H2
<!-- id: <h2_2>, length: <section length> -->
```

**Iteration 3**

Expansion:
```md
H1
H2
paragraph_1_preview...
<!-- id: <paragraph_1>, length: <block length> -->
H2
paragraph_2_preview...
<!-- id: <paragraph_2>, length: <block length> -->
```
Scoring:
```txt
paragraph_1: high
paragraph_2: medium
```
Nothing to prune.

**Iteration 4**

Expansion:
```md
H1
H2
paragraph_1
<!-- id: <paragraph_1> -->
H2
paragraph_2
<!-- id: <paragraph_2> -->
```
Scoring:
```txt
paragraph_1: high
paragraph_2: high
```
There is nothing left to prune or expand, final result:
```md
H1
H2
paragraph_1
H2
paragraph_2
```

### Advantages

- **High accuracy** - by reviewing all DB elements, the risk of missing required information is low.
- **Low resource usage** - no expensive model is required; tokens and context window are used efficiently.
