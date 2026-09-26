import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });
if (!process.env.MONGODB_URI) {
  dotenv.config({ path: path.join(__dirname, "../.env") });
}

// User Schema (inline or imported)
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    avatar: { type: String, default: "" },
    bio: { type: String, default: "" },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

// Article Schema
const articleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    content: { type: String, required: true },
    excerpt: { type: String, trim: true, default: "" },
    thumbnail: { type: String, default: "" },
    category: { type: String, required: true, trim: true },
    tags: [{ type: String, trim: true }],
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["draft", "published"], default: "published" },
    viewCount: { type: Number, default: 0 },
    likesCount: { type: Number, default: 0 },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const Article = mongoose.models.Article || mongoose.model("Article", articleSchema);

// Comment Schema
const commentSchema = new mongoose.Schema(
  {
    content: { type: String, required: true, trim: true },
    article: { type: mongoose.Schema.Types.ObjectId, ref: "Article", required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const Comment = mongoose.models.Comment || mongoose.model("Comment", commentSchema);

const seedAuthors = [
  {
    name: "Manasa Devarasetty",
    email: "manasa@devstory.io",
    password: "Password@123",
    role: "admin",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    bio: "Full-Stack Architect & Creator of DevStory. Passionate about distributed systems, React 19, and cloud scalability.",
  },
  {
    name: "Alex Rivera",
    email: "alex.rivera@devstory.io",
    password: "Password@123",
    role: "user",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    bio: "Principal Frontend Engineer specializing in React internals, performance benchmarking, and design tokens.",
  },
  {
    name: "Sophia Chen",
    email: "sophia.chen@devstory.io",
    password: "Password@123",
    role: "user",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    bio: "AI Research Scientist & MLOps specialist focusing on large language models and edge inference pipelines.",
  },
  {
    name: "Marcus Vance",
    email: "marcus.vance@devstory.io",
    password: "Password@123",
    role: "user",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    bio: "Staff Site Reliability Engineer & Kubernetes enthusiast. Writer on fault-tolerant distributed systems.",
  },
  {
    name: "Elena Rostova",
    email: "elena.rostova@devstory.io",
    password: "Password@123",
    role: "user",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
    bio: "Database Architect with 10+ years optimizing high-throughput distributed MongoDB and PostgreSQL clusters.",
  },
];

const seedArticlesData = [
  {
    title: "Building Ultra-Fast Web Applications with React 19 and Vite: The Definitive Guide",
    slug: "building-ultra-fast-web-applications-react-19-vite",
    category: "Web Development",
    authorIndex: 1, // Alex Rivera
    thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=1200&q=80",
    excerpt:
      "Explore the ground-breaking features of React 19, including Server Components, Actions, useOptimistic, and how pairing with Vite 6 delivers sub-second load times and seamless developer experience.",
    tags: ["React 19", "Vite", "JavaScript", "Frontend", "Performance", "WebDev"],
    viewCount: 1420,
    likesCount: 89,
    content: `<h2>Introduction: The Evolution of React in 2026</h2>
<p>React 19 represents one of the most substantial leaps in frontend architecture since the introduction of Hooks. With first-class asynchronous Actions, the Asset Loading API, native document metadata management, and deep compiler optimizations, building high-performance modern web applications is easier and more intuitive than ever.</p>

<p>When combined with Vite's lightning-fast Hot Module Replacement (HMR) and Rollup-powered production bundling, developers can achieve unparalleled developer velocity and deliver lightweight, ultra-responsive user interfaces.</p>

<h3>1. Mastering React 19 Actions and Asynchronous Transitions</h3>
<p>In earlier versions of React, handling pending states, error states, and optimistic UI updates for forms required juggling multiple <code>useState</code> and <code>useEffect</code> calls. React 19 streamlines this through <code>useActionState</code> and <code>useOptimistic</code>.</p>

<pre><code class="language-jsx">// Example: Seamless optimistic update with React 19
import { useActionState, useOptimistic } from 'react';

async function updateArticle(prevState, formData) {
  const title = formData.get('title');
  const res = await fetch('/api/articles/edit', {
    method: 'POST',
    body: JSON.stringify({ title })
  });
  return await res.json();
}

export function ArticleTitleEditor({ currentTitle }) {
  const [state, formAction, isPending] = useActionState(updateArticle, { title: currentTitle });
  const [optimisticTitle, setOptimisticTitle] = useOptimistic(
    state.title,
    (current, update) => update
  );

  return (
    &lt;form action={async (formData) =&gt; {
      setOptimisticTitle(formData.get('title'));
      await formAction(formData);
    }}&gt;
      &lt;h1&gt;{optimisticTitle}&lt;/h1&gt;
      &lt;input name="title" defaultValue={state.title} disabled={isPending} /&gt;
      &lt;button type="submit"&gt;{isPending ? 'Saving...' : 'Save'}&lt;/button&gt;
    &lt;/form&gt;
  );
}</code></pre>

<h3>2. Asset Preloading and Style Hoisting</h3>
<p>React 19 introduces automatic stylesheet hoisting and resource preloading primitives directly into component lifecycles. Instead of manually injecting link tags in <code>&lt;head&gt;</code>, components can declare their dependencies right where they are used:</p>

<ul>
  <li><strong>preload() / preinit():</strong> Eagerly fetch critical web fonts, scripts, and API assets before rendering starts.</li>
  <li><strong>Native &lt;title&gt; and &lt;meta&gt; support:</strong> Hoisted dynamically into document head without third-party head manager packages.</li>
  <li><strong>Instant hydration:</strong> Zero layout shifts and automated stream prioritization for above-the-fold content.</li>
</ul>

<blockquote><p>"The best UI performance is the one the user never notices. By letting React orchestrate async boundaries natively, micro-stalls and loading flickers are completely eliminated."</p></blockquote>

<h3>3. Vite Bundler Tuning Checklist</h3>
<p>To extract maximum performance when deploying to static hosting environments like Vercel or Netlify, adhere to these fundamental Vite optimization practices:</p>

<ol>
  <li><strong>Tree-shaking icon libraries:</strong> Import icons specifically (e.g. <code>import { Eye } from 'lucide-react'</code>) rather than using barrel wildcard imports.</li>
  <li><strong>Chunk splitting:</strong> Configure <code>manualChunks</code> in <code>vite.config.js</code> to separate heavy third-party vendor bundles (such as chart libraries or rich-text engines) from core application code.</li>
  <li><strong>Modern CSS compilation:</strong> Utilize Tailwind CSS with LightningCSS for zero-runtime stylesheet generation and automatic prefixing.</li>
</ol>

<h3>Conclusion</h3>
<p>By leveraging React 19's unified async model alongside Vite's instant compilation pipeline, engineering teams can build resilient, accessible, and blindingly fast web platforms with minimal boilerplate. Start adopting these paradigms in your projects today!</p>`,
  },
  {
    title: "Microservices vs Modular Monoliths in 2026: Lessons from Scaling to 10M Requests",
    slug: "microservices-vs-modular-monoliths-lessons-scaling",
    category: "Cloud Architecture",
    authorIndex: 0, // Manasa Devarasetty
    thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
    excerpt:
      "A pragmatic architectural retrospective on when to decompose into distributed microservices and why modular monoliths with strict domain boundaries are dominating enterprise system designs.",
    tags: ["Microservices", "System Design", "Architecture", "Backend", "Scalability", "Node.js"],
    viewCount: 2310,
    likesCount: 142,
    content: `<h2>The Architecture Pendulum: From Distributed Sprawl Back to Modularity</h2>
<p>Over the past decade, software engineering teams rushed into microservices architectures as a silver bullet for team autonomy and horizontal scale. However, breaking a system into dozens of independent network-isolated services introduces significant operational overhead: distributed tracing complexity, eventual consistency anomalies, multi-hop network latencies, and challenging local development setups.</p>

<p>In 2026, the <strong>Modular Monolith</strong> has emerged as the premier architecture pattern for high-growth engineering organizations that need both velocity and scale without the operational penalty of premature distributed microservices.</p>

<h3>1. Anatomy of a Clean Modular Monolith</h3>
<p>A modular monolith is not a disorganized spaghetti codebase. Rather, it is an application composed of strictly isolated domain packages that interact solely through well-defined in-process public APIs and event contracts.</p>

<pre><code class="language-text">src/
├── modules/
│   ├── identity/          # Authentication, Roles, Profile management
│   │   ├── api/           # Public interface exposed to other modules
│   │   ├── internal/      # Private models, services, data repositories
│   │   └── index.ts       # Controlled export barrier
│   ├── content/           # Articles, Categories, Slugs, View counting
│   ├── engagement/        # Comments, Reactions, Bookmarks
│   └── notifications/     # Email digests, Push notifications
├── shared/                # Kernel utilities, Database connection pool
└── app.ts                 # HTTP route orchestration & middleware bootstrap</code></pre>

<h3>2. The Cost of Distributed Networks</h3>
<p>When evaluating whether to split a bounded context into a standalone microservice, compare the physical performance characteristics:</p>

<ul>
  <li><strong>In-memory function invocation:</strong> ~0.0001 ms (sub-microsecond), zero serialization overhead, zero network failure modes.</li>
  <li><strong>Internal VPC HTTP/gRPC call:</strong> 1.5 ms – 8.0 ms, JSON/Protobuf marshaling cost, connection pooling maintenance, retry budgets, circuit breaking.</li>
  <li><strong>Distributed transactions (2-Phase Commit / Sagas):</strong> High cognitive load, dual-write failure vulnerabilities, complicated rollbacks.</li>
</ul>

<blockquote><p>"Unless two bounded contexts have vastly mismatched hardware scaling profiles (e.g. GPU video processing vs lightweight CRUD API), keeping them in the same runtime boundary accelerates product iteration by 10x."</p></blockquote>

<h3>3. When Should You Actually Decompose?</h3>
<p>Decomposing a modular monolith into standalone microservices is justified under specific, measurable scenarios:</p>

<ol>
  <li><strong>Independent scaling axes:</strong> A notification streaming daemon consuming millions of websocket connections requires drastically different memory/CPU allocation than the REST API.</li>
  <li><strong>Organizational scale:</strong> When distinct engineering squads (20+ engineers per domain) require separate deployment pipelines and release cadence.</li>
  <li><strong>Polyglot workloads:</strong> Heavy machine learning tasks in Python/C++ integrated alongside TypeScript and Go services.</li>
</ol>

<h3>Key Takeaways</h3>
<p>Begin with a clean, domain-driven modular monolith. Enforce strict architectural boundaries using module linters. When your throughput and team size truly demand physical network separation, extracting a decoupled module into an independent service becomes a trivial, low-risk refactoring exercise.</p>`,
  },
  {
    title: "Fine-Tuning Open-Source LLMs for Real-Time Production Reasoning: A Hands-on Blueprint",
    slug: "fine-tuning-open-source-llms-production-reasoning",
    category: "AI & Machine Learning",
    authorIndex: 2, // Sophia Chen
    thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
    excerpt:
      "A complete guide to quantizing, fine-tuning using LoRA/QLoRA, and serving open weights models like Llama 3 and Mistral with vLLM for high-throughput, low-latency enterprise AI workflows.",
    tags: ["AI", "Machine Learning", "LLM", "Python", "PyTorch", "vLLM", "Deep Learning"],
    viewCount: 1890,
    likesCount: 118,
    content: `<h2>Empowering Custom AI Beyond Proprietary APIs</h2>
<p>While closed-source frontier models provide general capabilities out of the box, enterprise applications increasingly demand deterministic domain-specific outputs, low inference latency, robust data privacy, and predictable cost structures. Fine-tuning open-source foundation models on domain-specific datasets enables organizations to own their intellectual property and run models securely on private infrastructure.</p>

<h3>1. Parameter-Efficient Fine-Tuning (PEFT) with QLoRA</h3>
<p>Traditional full-parameter fine-tuning of 8B to 70B parameter models requires massive clusters of 80GB H100 GPUs. Low-Rank Adaptation (LoRA) and 4-bit Quantized LoRA (QLoRA) make training accessible by freezing base model weights and training small rank decomposition matrices.</p>

<pre><code class="language-python"># Example: Fine-tuning setup using HuggingFace & Unsloth
from transformers import TrainingArguments
from peft import LoraConfig, get_peft_model
from trl import SFTTrainer

lora_config = LoraConfig(
    r=16,                         # Rank dimension
    lora_alpha=32,                # Scaling factor
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"],
    lora_dropout=0.05,
    bias="none",
    task_type="CAUSAL_LM"
)

trainer = SFTTrainer(
    model=model,
    train_dataset=dataset,
    peft_config=lora_config,
    dataset_text_field="text",
    max_seq_length=4096,
    args=TrainingArguments(
        per_device_train_batch_size=4,
        gradient_accumulation_steps=4,
        warmup_steps=10,
        learning_rate=2e-4,
        fp16=True,
        logging_steps=1,
        output_dir="outputs",
    ),
)
trainer.train()</code></pre>

<h3>2. High-Throughput Inference with vLLM and PagedAttention</h3>
<p>Deploying fine-tuned weights for real-time customer traffic requires specialized inference engines capable of continuous batching. <strong>vLLM</strong> leverages PagedAttention to manage Key-Value (KV) cache memory dynamically, achieving up to 24x higher throughput compared to naive HuggingFace pipelines.</p>

<ul>
  <li><strong>Continuous batching:</strong> Incoming queries join active inference batches on the fly without waiting for previous requests to complete.</li>
  <li><strong>Quantized execution (AWQ / FP8):</strong> Cuts memory footprint in half with imperceptible loss in precision.</li>
  <li><strong>OpenAI-compatible endpoints:</strong> Direct drop-in replacement for existing application clients.</li>
</ul>

<blockquote><p>"The true competitive advantage in applied AI is not the foundation model itself, but the proprietary data quality and the low-latency feedback loop baked into your inference infrastructure."</p></blockquote>

<h3>3. Production Guardrails and Structured Outputs</h3>
<p>For mission-critical production workflows, ensuring that model completions adhere strictly to predefined JSON schemas is essential. Modern engines support constrained decoding (via tools like Outlines or Instructor), guaranteeing 100% syntactically valid JSON responses for API consumption.</p>`,
  },
  {
    title: "Zero-Downtime Multi-Region Deployments: Kubernetes, Terraform, and Canary Releases",
    slug: "zero-downtime-multi-region-deployments-kubernetes-terraform",
    category: "DevOps & SRE",
    authorIndex: 3, // Marcus Vance
    thumbnail: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=1200&q=80",
    excerpt:
      "Step-by-step strategies for architecting zero-downtime rolling updates, automated canary rollouts with Argo Rollouts, and multi-region infrastructure provisioning using Terraform.",
    tags: ["Kubernetes", "DevOps", "Terraform", "CI/CD", "SRE", "Cloud"],
    viewCount: 1650,
    likesCount: 95,
    content: `<h2>The Gold Standard of Continuous Delivery: 99.99% Availability</h2>
<p>Modern cloud systems must withstand continuous software releases, database schema migrations, and sudden infrastructure hiccups without ever dropping an active user session or returning a 5xx error. Achieving true zero-downtime deployments requires disciplined choreography across infrastructure provisioning, container orchestrators, and network traffic management.</p>

<h3>1. Progressive Delivery with Argo Rollouts and Canary Analysis</h3>
<p>Rather than deploying new software versions to 100% of production traffic at once (blue/green) or blindly updating pods (rolling update), progressive delivery allows routing a tiny fraction (e.g. 5%) of live requests to the new canary revision while automated metrics monitor error rates and latency.</p>

<pre><code class="language-yaml">apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: devstory-api-rollout
spec:
  replicas: 10
  strategy:
    canary:
      steps:
      - setWeight: 5
      - pause: { duration: 10m }
      - setWeight: 25
      - pause: { duration: 15m }
      - setWeight: 50
      - pause: { duration: 10m }
      analysis:
        templates:
        - templateName: success-rate-check
        args:
        - name: service-name
          value: devstory-api-canary</code></pre>

<h3>2. Graceful Shutdown & Kubernetes Lifecycle Hooks</h3>
<p>When a container is terminated during a deployment, in-flight HTTP requests will be severed if the process exits before upstream load balancers remove the pod from their active endpoints table. Proper lifecycle coordination is essential:</p>

<ol>
  <li><strong>PreStop Hook:</strong> Add a <code>sleep 10</code> command before termination to allow kube-proxy and Ingress controllers to deregister the pod IP.</li>
  <li><strong>TerminationGracePeriodSeconds:</strong> Grant adequate time (e.g. 30–60 seconds) for long-lived database connections or write operations to finish gracefully.</li>
  <li><strong>Readiness Probes:</strong> Never route traffic to a pod until database connection pools and warm caches are verified healthy.</li>
</ol>

<h3>3. Multi-Region Global Traffic Routing</h3>
<p>Deploying across multiple geographic cloud regions provides both latency reduction for international users and disaster recovery resilience against single-zone cloud outages. By deploying globally distributed Anycast IPs with Cloudflare or AWS Route 53 latency-based routing, traffic automatically reroutes to adjacent healthy regions during local disruptions.</p>`,
  },
  {
    title: "Mastering MongoDB Indexing Strategies for High-Throughput Read & Write Workloads",
    slug: "mastering-mongodb-indexing-strategies-high-throughput",
    category: "Database Systems",
    authorIndex: 4, // Elena Rostova
    thumbnail: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=1200&q=80",
    excerpt:
      "Unlock sub-millisecond database queries. Learn the Equality, Sort, Range (ESR) rule, compound index optimization, partial indexes, and how to eliminate costly COLLSCANs in production.",
    tags: ["MongoDB", "Database", "NoSQL", "Performance", "Backend", "Mongoose"],
    viewCount: 2780,
    likesCount: 164,
    content: `<h2>Why Proper Indexing is the Heart of Database Performance</h2>
<p>In MongoDB, an unindexed query forces the storage engine to perform a full collection scan (<code>COLLSCAN</code>), reading every single document from disk and consuming massive memory and CPU. As your data volume grows into millions of records, query latencies degrade from a few milliseconds to several seconds.</p>

<p>Mastering the art of index design ensures your database engine performs lean index lookups (<code>IXSCAN</code>) with minimal memory footprint.</p>

<h3>1. The Golden ESR Rule (Equality, Sort, Range)</h3>
<p>When creating compound indexes for queries that filter and sort simultaneously, always order your index keys according to the <strong>ESR Rule</strong>:</p>

<ul>
  <li><strong>Equality:</strong> Fields matching exact values (e.g. <code>status: "published"</code>, <code>author: authorId</code>).</li>
  <li><strong>Sort:</strong> Fields determining sort order (e.g. <code>createdAt: -1</code>).</li>
  <li><strong>Range:</strong> Fields filtered by ranges, inequalities, or regular expressions (e.g. <code>viewCount: { $gt: 100 }</code>).</li>
</ul>

<pre><code class="language-javascript">// Correct compound index following ESR:
// Equality: status ("published") -> Sort: createdAt (-1) -> Range: category ("Web Development")
articleSchema.index({ status: 1, createdAt: -1, category: 1 });

// In Mongoose / MongoDB Shell:
db.articles.find({ status: "published", category: "Engineering" })
  .sort({ createdAt: -1 })
  .explain("executionStats");</code></pre>

<h3>2. Partial & Sparse Indexes: Saving RAM and Write Throughput</h3>
<p>Indexes are not free—every insert, update, and delete operation must update all corresponding index trees in memory (WiredTiger cache). By utilizing <strong>Partial Indexes</strong>, you can index only documents that meet a specific condition, saving up to 80% in index memory.</p>

<pre><code class="language-javascript">// Index only published articles for fast public search
articleSchema.index(
  { title: "text", content: "text", tags: 1 },
  {
    partialFilterExpression: { status: "published" },
    name: "published_articles_text_idx"
  }
);</code></pre>

<blockquote><p>"The ideal database query has an <code>nReturned / totalDocsExamined</code> ratio of 1.0. If you examine 10,000 documents to return 10, your indexing strategy requires immediate attention."</p></blockquote>

<h3>3. Monitoring and Removing Redundant Indexes</h3>
<p>Regularly inspect <code>$indexStats</code> in your production MongoDB Atlas cluster to identify indexes that have zero access count over a 30-day window. Dropping unused indexes frees up vital cache memory for active working sets and accelerates write operations across your cluster.</p>`,
  },
  {
    title: "Designing Modern Dark Mode Design Systems: Color Contrast, Glassmorphism, and Fluid Animations",
    slug: "designing-modern-dark-mode-design-systems",
    category: "UI/UX Design",
    authorIndex: 1, // Alex Rivera
    thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80",
    excerpt:
      "A deep dive into crafting premium UI experiences with semantic CSS design tokens, WCAG AAA accessible dark modes, subtle glassmorphism backdrops, and silky smooth micro-interactions.",
    tags: ["UI/UX", "CSS", "Tailwind", "Design Systems", "Web Design", "Accessibility"],
    viewCount: 1940,
    likesCount: 126,
    content: `<h2>Beyond Just Inverting Colors: The Art of Modern Dark Theme Design</h2>
<p>Dark mode is no longer a trendy gimmick—it is a core expectation for professional developers and digital creators. However, simply setting a background to <code>#000000</code> and text to <code>#FFFFFF</code> creates harsh contrast ratios that induce severe eye strain and ruin visual hierarchy.</p>

<p>A refined dark mode requires layered depth elevation, curated slate/zinc tones, balanced luminescence, and intentional color accents.</p>

<h3>1. Establishing Semantic Elevation Tones</h3>
<p>In real-world lighting, objects closer to the viewer reflect more light. Rather than relying on heavy drop shadows in dark mode, elevation is conveyed through subtle increases in surface brightness:</p>

<ul>
  <li><strong>Background (Base Layer):</strong> <code>#090d16</code> or <code>#0b0f19</code> (Deep navy/slate foundation)</li>
  <li><strong>Card Surfaces (Layer 1):</strong> <code>#111827</code> / <code>slate-900</code> with a <code>border border-slate-800/80</code></li>
  <li><strong>Hover States & Popovers (Layer 2):</strong> <code>#1e293b</code> / <code>slate-800</code></li>
  <li><strong>Active Controls (Layer 3):</strong> <code>#334155</code> / <code>slate-700</code></li>
</ul>

<h3>2. Glassmorphism and Backdrop Blur Optimization</h3>
<p>Modern glassmorphic navigation bars and modal overlays create a tactile sense of depth when content scrolls beneath them. Achieving this with zero performance drops requires hardware-accelerated CSS properties:</p>

<pre><code class="language-css">/* Sleek, performant glassmorphic navbar style */
.glass-header {
  background-color: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  will-change: transform;
}</code></pre>

<h3>3. Color Contrast and Accessibility (WCAG 2.1)</h3>
<p>Pure white (<code>#ffffff</code>) on pure black produces chromatic aberration for readers with astigmatism. Instead, utilize warm neutral text shades such as <code>slate-200</code> (<code>#e2e8f0</code>) for primary body copy and <code>slate-400</code> (<code>#94a3b8</code>) for secondary metadata to deliver comfortable, fatigue-free reading sessions.</p>`,
  },
  {
    title: "Zero Trust Security Architectures for Modern SaaS: Defending Against Identity and Token Attacks",
    slug: "zero-trust-security-architectures-modern-saas",
    category: "Cybersecurity",
    authorIndex: 0, // Manasa Devarasetty
    thumbnail: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80",
    excerpt:
      "How to implement zero-trust principles across web APIs, secure JWT token rotation, protect against XSS/CSRF vulnerabilities, and enforce granular role-based access control in cloud applications.",
    tags: ["Cybersecurity", "Zero Trust", "JWT", "OAuth", "Node.js", "Security"],
    viewCount: 1520,
    likesCount: 98,
    content: `<h2>Never Trust, Always Verify: The Philosophy of Zero Trust</h2>
<p>The traditional perimeter security model ("castle-and-moat") assumed that anything inside the internal network was inherently trustworthy. In modern cloud and remote environments, with distributed APIs, microservices, and third-party integrations, the perimeter has completely dissolved.</p>

<p><strong>Zero Trust</strong> operates under the core assumption of breach: every single request must be authenticated, authorized, and cryptographically verified regardless of where it originates.</p>

<h3>1. Bulletproof JWT Token Lifecycles</h3>
<p>Storing long-lived JWT access tokens in browser <code>localStorage</code> leaves applications vulnerable to Cross-Site Scripting (XSS) credential theft. A hardened authentication strategy adheres to these principles:</p>

<ul>
  <li><strong>Short-lived access tokens:</strong> Set expiration between 5 to 15 minutes.</li>
  <li><strong>Secure HTTP-only refresh cookies:</strong> Stored with <code>HttpOnly; Secure; SameSite=Strict</code> flags, inaccessible to JavaScript.</li>
  <li><strong>Refresh token rotation:</strong> Invalidate entire token families if a revoked token is reused.</li>
</ul>

<pre><code class="language-javascript">// Express JWT Verification & Role-Based Access Guard
export function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You do not possess adequate security privileges."
      });
    }
    next();
  };
}</code></pre>

<h3>2. Defense in Depth: Content Security Policy (CSP) & Sanitization</h3>
<p>To eliminate XSS and injection attacks from rich-text blog editors and user comments, always perform multi-tier sanitization:</p>

<ol>
  <li><strong>Server-side input sanitization:</strong> Strip malicious tags and javascript pseudoprotocols using DOMPurify before storing data in MongoDB.</li>
  <li><strong>Content Security Policy (CSP):</strong> Enforce strict HTTP response headers restricting script sources and frame ancestors.</li>
  <li><strong>Rate limiting & brute-force defense:</strong> Protect authentication endpoints against automated credential stuffing with IP-based and user-based throttling.</li>
</ol>`,
  },
  {
    title: "Clean Code and Domain-Driven Design in Modern TypeScript and Node.js Services",
    slug: "clean-code-domain-driven-design-typescript-nodejs",
    category: "Engineering",
    authorIndex: 0, // Manasa Devarasetty
    thumbnail: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80",
    excerpt:
      "Bridge business strategy and software implementation. How to structure domain models, value objects, repositories, and unit-tested business logic in production Node.js applications.",
    tags: ["TypeScript", "Node.js", "Clean Code", "DDD", "Software Engineering", "Architecture"],
    viewCount: 2150,
    likesCount: 135,
    content: `<h2>Bridging Software Architecture and Business Reality</h2>
<p>Too many enterprise software projects devolve into anemic data structures where database tables dictate code structure and controllers are bloated with hundreds of lines of procedural conditional statements. <strong>Domain-Driven Design (DDD)</strong> shifts the focus back to where it belongs: the core business domain and complex business rules.</p>

<h3>1. Entities vs Value Objects</h3>
<p>A fundamental distinction in domain modeling is understanding when an object represents an identity versus an immutable attribute value:</p>

<ul>
  <li><strong>Entity:</strong> Defined by a continuous identity that persists across state changes (e.g. an <code>Article</code> or a <code>UserAccount</code>).</li>
  <li><strong>Value Object:</strong> Defined entirely by its attributes, completely immutable, and self-validating (e.g. an <code>EmailAddress</code>, a <code>Slug</code>, or a <code>Money</code> amount).</li>
</ul>

<pre><code class="language-typescript">// Example: Self-validating Value Object
export class ArticleSlug {
  private readonly value: string;

  private constructor(slug: string) {
    this.value = slug;
  }

  public static create(title: string): ArticleSlug {
    if (!title || title.trim().length === 0) {
      throw new Error("Cannot generate slug from empty title.");
    }
    const clean = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return new ArticleSlug(clean);
  }

  public getValue(): string {
    return this.value;
  }
}</code></pre>

<h3>2. The Repository Pattern and Decoupled Persistence</h3>
<p>By defining repository interfaces inside your core domain layer and implementing database adapters (Mongoose, Prisma, TypeORM) in an outer infrastructure layer, your business rules remain 100% pure and can be unit tested without requiring a mock database connection.</p>

<blockquote><p>"Architecture is about intent. When you look at the root directory of a project, it should scream what the business does, not what database or web framework it uses."</p></blockquote>

<h3>3. Summary</h3>
<p>Adopting clean code and DDD principles ensures that as your platform scales in complexity, adding new features remains predictable, safe, and enjoyable for your engineering team.</p>`,
  },
];

const sampleComments = [
  "Phenomenal breakdown! The code examples made the concepts immediately applicable to our stack.",
  "We recently migrated to this architecture and saw our p99 response times drop by over 60%. Great article!",
  "Very thorough and well-explained. Bookmarked this for our entire engineering team to review.",
  "The explanation on ESR indexing and memory allocation was an eye-opener. Thanks for sharing!",
  "Great insights! Looking forward to the next deep dive in this series.",
];

async function seed() {
  try {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected successfully to MongoDB.");

    // 1. Create or upsert authors
    const createdAuthors = [];
    for (const authorData of seedAuthors) {
      let user = await User.findOne({ email: authorData.email });
      if (!user) {
        const hashedPassword = await bcrypt.hash(authorData.password, 10);
        user = await User.create({
          ...authorData,
          password: hashedPassword,
        });
        console.log(`Created author: ${user.name} (${user.email})`);
      } else {
        user.name = authorData.name;
        user.avatar = authorData.avatar;
        user.bio = authorData.bio;
        user.role = authorData.role;
        await user.save();
        console.log(`Updated author: ${user.name}`);
      }
      createdAuthors.push(user);
    }

    // 2. Remove old one-line dummy test articles
    const deleteResult = await Article.deleteMany({
      $or: [
        { title: { $regex: /Confidential Upcoming Features/i } },
        { title: { $regex: /Test Article/i } },
        { title: { $regex: /Bookmark Test/i } },
        { title: { $regex: /Likes Test/i } },
        { title: { $regex: /Admin Moderation Test/i } },
        { title: { $regex: /Comment Test/i } },
        { content: "Unpublished roadmap draft." },
        { content: { $regex: /^Testing article likes/i } },
        { content: { $regex: /^Content for bookmark/i } },
        { content: { $regex: /^Detailed technical content for testing/i } },
      ],
    });
    console.log(`Cleaned up ${deleteResult.deletedCount} dummy test articles.`);

    // 3. Upsert rich full-length articles
    for (const articleData of seedArticlesData) {
      const author = createdAuthors[articleData.authorIndex] || createdAuthors[0];

      let article = await Article.findOne({ slug: articleData.slug });
      if (!article) {
        article = await Article.create({
          title: articleData.title,
          slug: articleData.slug,
          category: articleData.category,
          author: author._id,
          thumbnail: articleData.thumbnail,
          excerpt: articleData.excerpt,
          tags: articleData.tags,
          content: articleData.content,
          status: "published",
          viewCount: articleData.viewCount,
          likesCount: articleData.likesCount,
        });
        console.log(`Created rich article: "${article.title}"`);
      } else {
        article.title = articleData.title;
        article.category = articleData.category;
        article.author = author._id;
        article.thumbnail = articleData.thumbnail;
        article.excerpt = articleData.excerpt;
        article.tags = articleData.tags;
        article.content = articleData.content;
        article.status = "published";
        article.viewCount = articleData.viewCount;
        article.likesCount = articleData.likesCount;
        await article.save();
        console.log(`Updated rich article: "${article.title}"`);
      }

      // 4. Seed sample discussion comments if none exist
      const existingComments = await Comment.countDocuments({ article: article._id });
      if (existingComments === 0) {
        for (let i = 0; i < 3; i++) {
          const commentAuthor = createdAuthors[(i + 1) % createdAuthors.length];
          const commentText = sampleComments[(articleData.title.length + i) % sampleComments.length];
          await Comment.create({
            content: commentText,
            article: article._id,
            author: commentAuthor._id,
          });
        }
        console.log(`Added discussion comments for "${article.title}"`);
      }
    }

    const totalArticles = await Article.countDocuments({ status: "published" });
    console.log(`\n🎉 Seed Complete! Active published articles in database: ${totalArticles}`);
  } catch (error) {
    console.error("Seeding error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

seed();
