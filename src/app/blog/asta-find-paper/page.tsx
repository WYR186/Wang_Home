'use client';

import PretextArticle from '@/components/blog/PretextArticle';
import { useLocaleStore } from '@/lib/stores/localeStore';

const englishMarkdown = `
![Reconstructed Asta Paper Finder pipeline, based on the Ai2 blog, the open-source snapshot, and local code inspection.](/blog/asta_find_paper/asta pipeline.png)

Most AI search tools are described as if they were just "LLM + retrieval." After digging into Asta Paper Finder, that description feels too shallow. What makes Asta interesting is not only model usage, but how the pipeline turns search into a sequence of explicit decisions.

At a high level, the system first analyzes a user query, routes it into a workflow, reformulates the query, retrieves candidates, expands through citations, judges relevance, and only then performs final ranking. In this design, the model does more than answer generation. It is part of the control logic.

One thing to keep straight is that public evidence points to two visible versions: the production-facing system (as described in the blog and live product) and a partial open-source snapshot. They overlap, but they are not fully identical. That gap explains why parts of retrieval infrastructure are only partly visible in the released repository.

The most interesting part, in my view, is relevance judgment. Asta does not rely on one opaque "overall relevance" score. It appears to evaluate papers using per-criterion judgments, closer to checking requirement coverage than assigning a single scalar label.

Reranking is also more explicit than expected. In the local code path, content relevance is assembled from LLM judgment, Cohere rerank score, and snippet-level signals. This content score is then combined with metadata-aware signals such as recency and citation centrality. Weights change according to query intent (for example, recent vs. influential papers).

Another detail revealed by the snapshot is stage-specific model assignment. In the public config, query analyzer and query reformulation use GPT-5-mini with medium reasoning; relevance judgment uses GPT-5-mini with minimal reasoning; and some title/suggestion paths use Gemini 3 Flash. This is role-based model allocation, not one model everywhere.

My main takeaway is simple: Asta treats scholarly search as structured decision-making. Retrieval remains important, but the engineering insight is how routing, iterative expansion, explicit relevance checks, and metadata-aware ranking are composed into one workflow.

## References

1. Ai2. (2025a, March 26). Introducing Ai2 Paper Finder. Allen Institute for AI. https://allenai.org/blog/paper-finder
2. Ai2. (2025b). Asta resources: Tools for building scientific AI agents. Allen Institute for AI. https://allenai.org/asta/resources
3. AllenAI. (2025). asta-paper-finder. GitHub. https://github.com/allenai/asta-paper-finder
4. Singh, A., et al. (2025). Ai2 Scholar QA: Organized literature synthesis with attribution. arXiv. doi:10.48550/arXiv.2504.10861
5. Upadhyay, S., Srinivasan, S., & Zamani, H. (2024). UMBRELA. arXiv:2406.06519. https://arxiv.org/abs/2406.06519
`;

const chineseMarkdown = `
![基于 Ai2 官方博客、开源快照与本地代码检查复原的 Asta Paper Finder 流水线示意图。](/blog/asta_find_paper/asta pipeline.png)

很多 AI 搜索产品会被概括成「LLM + 检索」。但在看完 Asta Paper Finder 后，我认为这个说法太浅。Asta 真正有意思的地方，不只是用了模型，而是把学术搜索组织成了一系列可分解的决策流程。

从公开信息看，这条流水线通常包括：查询分析、流程路由、查询改写、候选召回、基于引用的扩展、相关性判定，以及最终排序。也就是说，LLM 不只是末端回答器，而是参与了前面的“流程控制”。

分析时最容易混淆的一点是：公开资料其实对应两个版本。一个是产品侧可见系统（博客和在线界面描述），另一个是开源发布的局部快照。两者有重叠，但并不完全一致，所以你会看到某些检索基础设施在开源代码中只露出部分实现。

我最看重的环节是相关性判断。Asta 看起来并不是只给一个“总体相关性”分数，而是更接近按标准逐项判断——把 query 需求拆开检查覆盖情况，而不是压成一个黑盒数字。

重排序也比预想更工程化。在本地代码路径中，内容相关分不是单来源，而是由 LLM 相关性判断、Cohere rerank 分和 snippet 信号共同构成。之后再与时间新近性、引用中心性等元数据信号融合，而且权重会随查询意图变化（例如更偏“最新”还是更偏“高影响力”）。

开源快照还透露了一个关键信号：分阶段模型分配。公开配置里，query analyzer 与 reformulation 使用 GPT-5-mini（medium reasoning），relevance judgment 使用 GPT-5-mini（minimal reasoning），部分标题/建议路径使用 Gemini 3 Flash。也就是说，这套系统按“任务角色”分配模型，而非全链路单模型。

我的结论很直接：Asta 的价值在于它把学术检索当成结构化决策问题来做。检索当然重要，但更值得学习的是它如何把路由、迭代扩展、显式相关性判断与元数据排序整合进一个可执行工作流。

## 参考资料

1. Ai2. (2025a, March 26). Introducing Ai2 Paper Finder. Allen Institute for AI. https://allenai.org/blog/paper-finder
2. Ai2. (2025b). Asta resources: Tools for building scientific AI agents. Allen Institute for AI. https://allenai.org/asta/resources
3. AllenAI. (2025). asta-paper-finder. GitHub. https://github.com/allenai/asta-paper-finder
4. Singh, A., et al. (2025). Ai2 Scholar QA: Organized literature synthesis with attribution. arXiv. doi:10.48550/arXiv.2504.10861
5. Upadhyay, S., Srinivasan, S., & Zamani, H. (2024). UMBRELA. arXiv:2406.06519. https://arxiv.org/abs/2406.06519
`;

export default function AstaFindPaperPage() {
  const locale = useLocaleStore((state) => state.locale);
  const isChinese = locale === 'zh';

  return (
    <PretextArticle
      title={
        isChinese
          ? 'Asta Paper Finder 内部机制：一篇简短深挖'
          : 'Inside Asta Paper Finder: A Short Deep Dive into an LLM Search Pipeline'
      }
      subtitle={
        isChinese
          ? '基于公开博客、开源快照和本地代码阅读后的结构化观察'
          : 'What I found after reading the public write-up, open-source snapshot, and ranking code.'
      }
      markdown={isChinese ? chineseMarkdown : englishMarkdown}
      referencesTitle={isChinese ? '以上引用可用于继续深入阅读。' : 'References are listed for deeper follow-up reading.'}
    />
  );
}
