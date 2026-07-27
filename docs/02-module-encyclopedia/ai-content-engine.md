---
title: "AI Content Engine"
documentType: "Module Specification"
version: "1.0.0"
status: "Active"
owner: "AVC Advertising Services"
project: "ANW AI-COS"
category: "Content"
tags: ["ai", "content", "medical-safety", "openai"]
dependencies: ["Knowledge Engine", "Supabase"]
---
# AI Content Engine
Transforms approved Supabase knowledge into structured blog, Facebook, carousel, reel, Pinterest, email, and YouTube drafts. The default carousel is 10 slides. Every patient-facing medical bundle remains in `medical_review` until a human approves it. The mock provider allows free testing; the OpenAI provider uses the Responses API with Zod structured output.
