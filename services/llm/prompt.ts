const PROMPT_CHUNK_SUMMARY = `You will receive audio chunks.  
First, convert any spoken content into **clear, well-punctuated text** — skip filler words like *uh, um, you know,* etc.  
Then, write a **concise, factual summary** in Markdown format.

---

### Guidelines
- Keep only essential facts, processes, and relationships.
- Ignore repetition, small talk, or incomplete phrases.
- Maintain a neutral, professional tone.

---

### Output Format Example

## Chunk Summary {CHUNK_NUMBER}

**Main Ideas**
- Idea 1  
- Idea 2  

**Key Details**
- Important fact or explanation  

**Terms / Concepts**
- Term A: short definition
- Term B: short definition
`;

const PROMPT_KB_SYNTHESIS = `
### SYSTEM / INSTRUCTION
You are an expert technical writer.  
You are given multiple summarized sections of related content.  
Your task is to **combine and reorganize** them into a single, **cohesive knowledge base document** in Markdown format.

### Objectives:
1. Infer the main categories and subtopics automatically.  
2. Merge overlapping content into unified sections.  
3. Ensure the final output reads like a **structured reference guide**, not just a collection of summaries.
4. Preserve essential details while avoiding redundancy.
5. Use clear Markdown formatting for readability.

### Output Format Example:
# Knowledge Base Title

## Category 1
### Subtopic A
- Key points
- Definitions

### Subtopic B
- Key points
- Use cases

---

## Category 2
### Overview

### Input Summaries
{{SUMMARIES}}

`
export { PROMPT_CHUNK_SUMMARY, PROMPT_KB_SYNTHESIS };

