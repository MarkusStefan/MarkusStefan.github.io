<a class="eyebrow" href="/research/">All research</a>

<p class="eyebrow">Research report · Markus Köfler · October 2026</p>

# Discovering Globally Aligned Representations through Causal Curiosity-Guided Exploration

<p class="report-lede">Globally aligned task codes improve transfer to unseen factor combinations in our controlled policy study. We investigate how an agent can discover the sharing relationships those codes express.</p>

Consider a hypothetical robot trained with a light body on slippery and high-friction surfaces. If a heavy body appears only on high-friction terrain, walking with that body on a slippery surface requires combining familiar conditions.

<div class="opening-media">
<figure>
<img src="/assets/images/research/causal-representations/puck-discovery-poster.webp" data-animation="/assets/images/research/causal-representations/puck-discovery.gif" data-poster="/assets/images/research/causal-representations/puck-discovery-poster.webp" width="960" height="453" alt="Puck discovery animation showing diagnostic trajectories in the project's analytical environment.">
<figcaption>Puck discovery example from the project presentation. Puck uses analytical dynamics.</figcaption>
</figure>
<figure>
<img src="/assets/images/research/causal-representations/heavy-ant-poster.webp" data-animation="/assets/images/research/causal-representations/heavy-ant.gif" data-poster="/assets/images/research/causal-representations/heavy-ant-poster.webp" width="500" height="500" alt="Heavy Ant performing a pirouette in the original Causal Curiosity demonstration.">
<figcaption>Heavy Ant pirouette. Causal Curiosity demonstration.</figcaption>
</figure>
<figure>
<img src="/assets/images/research/causal-representations/light-ant-poster.webp" data-animation="/assets/images/research/causal-representations/light-ant.gif" data-poster="/assets/images/research/causal-representations/light-ant-poster.webp" width="500" height="500" alt="Light Ant performing a pirouette in the original Causal Curiosity demonstration.">
<figcaption>Light Ant pirouette. Causal Curiosity demonstration.</figcaption>
</figure>
<figure>
<img src="/assets/images/research/causal-representations/heavy-hopper-poster.webp" data-animation="/assets/images/research/causal-representations/heavy-hopper.gif" data-poster="/assets/images/research/causal-representations/heavy-hopper-poster.webp" width="500" height="500" alt="Heavy Hopper jumping in the original Causal Curiosity demonstration.">
<figcaption>Heavy Hopper jump. Causal Curiosity demonstration.</figcaption>
</figure>
<figure>
<img src="/assets/images/research/causal-representations/light-hopper-poster.webp" data-animation="/assets/images/research/causal-representations/light-hopper.gif" data-poster="/assets/images/research/causal-representations/light-hopper-poster.webp" width="500" height="500" alt="Light Hopper jumping in the original Causal Curiosity demonstration.">
<figcaption>Light Hopper jump. Causal Curiosity demonstration.</figcaption>
</figure>
</div>

<button id="animation-toggle" class="animation-toggle" type="button" aria-pressed="false" hidden>Play demonstrations</button>

<p class="small">Ant and Hopper demonstrations by <a href="https://sites.google.com/usc.edu/causal-curiosity/home">Sontakke et al.</a> [3], also used in the presentation. They illustrate prior work and are separate from our RQ2 policy evaluations.</p>

<nav class="section-nav" aria-label="Report sections">
<a href="#motivation">Motivation</a><a href="#setup">Problem setup</a><a href="#alignment">Recursive discovery</a><a href="#contribution">Contribution</a><a href="#results">Experiments</a><a href="#limits">Limitations</a>
</nav>

<section id="motivation">

## Learning what can be shared

Compositional generalization means transferring to unseen combinations of familiar factor values. A representation that separates mass from friction could let experience with each property inform a new combination. For that reuse to work, the code for a given property must mean the same thing across environments.

<figure>
<img src="/assets/images/research/causal-representations/overview.svg" width="960" height="600" alt="Hypothetical mass and friction grid with heavy mass on low friction held out." loading="lazy">
<figcaption>The held-out combination contains familiar properties. This two-factor example explains the motivation. RQ2 evaluates three-factor task families.</figcaption>
</figure>

Causal representation learning seeks variables that explain a system's responses to interventions [1]. Observational data alone can admit several factor encodings, so identifying a particular factorization requires assumptions or further information [2].

We use diagnostic actions to compare responses across environments. A movement may expose mass differences while reducing the influence of friction. The agent chooses the movement, while hidden parameters stay fixed during each rollout. The target is to group environments by shared parameter values without observing those values directly.

</section>

<section id="setup">

## Environments, hidden parameters, and the sharing map

Let $\mathcal E=\{e^i\}_{i=1}^{N_{\mathcal E}}$ be the environment family. Environment $e^i$ has a fixed hidden vector

$$
\boldsymbol\eta^i=(\eta_1^i,\ldots,\eta_K^i)
\in\mathcal H_1\times\cdots\times\mathcal H_K.
$$

Here, $k$ indexes a physical or reward factor, and $\mathcal H_k$ contains its admissible values. The induced Markov decision process is

$$
\mathcal M^i=
(\mathcal S,\mathcal A,
\mathcal T_{\boldsymbol\eta^i},
\mathcal R_{\boldsymbol\eta^i},\rho_0,\gamma).
$$

Tasks share state and action spaces $\mathcal S$ and $\mathcal A$. The hidden vector conditions the transition kernel $\mathcal T$ and reward law $\mathcal R$. The initial-state distribution is $\rho_0$, and $\gamma$ is the discount factor. During discovery, the agent observes rollout responses but receives neither $\boldsymbol\eta^i$ nor the sharing relationships.

For each factor, the desired sharing map is the equivalence relation

$$
e^i\sim_k e^{i'}
\quad\Longleftrightarrow\quad
\eta_k^i=\eta_k^{i'}.
$$

A discovered categorical code should recover it through

$$
c_k^i=c_k^{i'}
\quad\Longleftrightarrow\quad
e^i\sim_k e^{i'},
\qquad c_k^i\in\{1,\ldots,L_k\},
$$

where $L_k=|\mathcal H_k|$ for the discrete factor levels studied here. A structured learner can then share a component between environments with equal labels, even when their other properties differ. The discovery setting supplies $K$ and the cardinalities $L_k$.

One global renaming of labels preserves the relation. A global reordering of coordinates also preserves it after matching coordinates to factors.

</section>

<section id="alignment">

## Why recursive discovery can lose global consistency

Causal Curiosity (CC) finds action sequences that separate environments by their responses [3]. It continues the search independently within each resulting branch. Those searches can assign different meanings to labels and code positions.

### Label permutation

Suppose both body-mass branches discover friction. Label 1 can mean low friction in the light-body branch and high friction in the heavy-body branch. Matching labels would then pool environments with different friction values.

### Dimension permutation

With three or more factors, branches can discover the remaining factors in different orders. The second coordinate might encode friction in one branch and motor gain in another.

At discovery stage $j$, write the branch-local code as

$$
\tilde c_j^i
=\sigma_b\!\left(c_{\kappa_b(j)}^i\right),
\qquad b=\tilde c_{<j}^i.
$$

The prefix $\tilde c_{<j}^i$ identifies the branch. Locally, $\kappa_b(j)$ denotes the factor discovered at stage $j$, and $\sigma_b$ is that branch's label bijection. Branch-dependent $\sigma_b$ causes label permutations. Branch-dependent $\kappa_b$ causes dimension permutations.

The full path can still identify each environment. An individual coordinate, however, no longer determines which environments share one factor value. Recovering the task identity is therefore insufficient to recover the sharing map.

<figure>
<img src="/assets/images/research/causal-representations/alignment-demo-poster.webp" data-animation="/assets/images/research/causal-representations/alignment-demo.gif" data-poster="/assets/images/research/causal-representations/alignment-demo-poster.webp" width="1100" height="418" alt="Conceptual animation comparing globally consistent friction labels with branch-dependent label reversals." loading="lazy">
<figcaption>In this hypothetical example, friction labels reverse between branches on the right. The animation uses zero-based labels for display. The equations use the thesis's one-based convention.</figcaption>
</figure>

<figure>
<img src="/assets/images/research/causal-representations/causal-curiosity.webp" width="1760" height="1092" alt="Causal Curiosity illustration of recursive experiments that distinguish shape, mass, and size." loading="lazy">
<figcaption>Recursive diagnostic experiments from the original Causal Curiosity project [3], used in the presentation.</figcaption>
</figure>

</section>

<section id="contribution">

## Discovering globally aligned factor codes

We formulate the discovery target as a set of factor-wise sharing relations. Each recovered coordinate must group the same parameter values across the environment family.

Our proposed method, Saturated Sequential Residualization (SSR), evaluates diagnostic experiments across the family and gives each new coordinate a common assignment. It removes response variation explained by earlier discoveries before searching for another factor.

The common assignment still needs informative experiments and enough coverage of factor combinations. Interactions between factors or missing combinations can prevent a coordinate from recovering the intended physical relation.

The evaluation separates discovery accuracy from the usefulness of the resulting structure. RQ2 addresses the latter by supplying ideal codes and changing their organization, so discovery errors cannot explain the comparison.

</section>

<section id="results">

## RQ2: control on unseen combinations

We compare aligned codes with mild, intermediate, and severe hierarchical label permutations. All four codes preserve complete task information. A fifth condition, the Generalist, receives zero context in the same input dimensions.

CPU Soft Actor-Critic (SAC), implemented in Stable-Baselines3, trains on half of each task grid. Every physical factor value appears during training. The other half contains unseen combinations and contributes no policy updates or test-time adaptation. Learner settings and interaction budgets match within each family.

The study covers Hopper, Ant, Walker2d, and HalfCheetah with ten policy seeds per condition. It fixes factor dimensions and varies labels, so it tests the label-permutation failure mode. The supplied codes are controlled representations, separate from those produced by running CC or SSR.

<figure>
<img src="/assets/images/research/causal-representations/rq2-heldout-curves.png" width="2160" height="1440" alt="Held-out learning curves for four MuJoCo task families, comparing aligned codes, three permutation conditions, and no context." loading="lazy">
<figcaption>Held-out returns across training. Lines average ten policy seeds. Shading shows pointwise 95% Student-t confidence intervals. The four families use different task rewards and axis scales. <a href="/assets/images/research/causal-representations/rq2-heldout-curves.pdf">PDF</a></figcaption>
</figure>

Aligned codes have the highest mean held-out return and area under the learning curve (AUC) in every family. Their paired AUC advantage over the Generalist is positive in all four families after correction for multiple comparisons.

Severe permutations fall below the Generalist on held-out AUC in every family. Intermediate permutations also fall below it in Hopper and HalfCheetah. The intermediate-code comparisons in Ant and Walker2d remain uncertain.

<figure>
<img src="/assets/images/research/causal-representations/rq2-auc-summary.png" width="2160" height="1260" alt="Held-out AUC for the five representation conditions in each environment family." loading="lazy">
<figcaption>AUC integrates held-out return over training and divides by the interaction budget. Higher is better. Error bars show uncorrected 95% Student-t intervals. The paired comparisons in the text use Bonferroni correction for 28 AUC contrasts. <a href="/assets/images/research/causal-representations/rq2-auc-summary.pdf">PDF</a></figcaption>
</figure>

### When context hurts transfer

HalfCheetah's intermediate and severe conditions reach high training returns while their held-out returns become negative. The final held-out means are 5,209.9 for aligned codes, −2,972.6 for intermediate permutations, −4,708.4 for severe permutations, and 972.5 without context.

<figure>
<img src="/assets/images/research/causal-representations/rq2-transfer-gap.png" width="2160" height="810" alt="HalfCheetah training and held-out returns, showing high training performance alongside negative transfer returns under stronger permutations." loading="lazy">
<figcaption>HalfCheetah training and held-out performance under the same six-million-interaction budget. Shading shows pointwise 95% Student-t intervals across ten policy seeds. <a href="/assets/images/research/causal-representations/rq2-transfer-gap.pdf">PDF</a></figcaption>
</figure>

A globally consistent category can carry evidence about one factor value across tasks. With branch-dependent labels, the policy must learn that category's meaning jointly with earlier code coordinates. The observed training-to-test gap is consistent with overfitting to the combinations seen during training.

</section>

<section id="limits">

## Limits of the comparison

The ten policy seeds use one fixed representation map and a parity split. The intervals describe learner variability conditional on those choices. Mean AUC decreases with permutation severity in all families, but corrected adjacent comparisons do not resolve every step of that ordering in Hopper.

Changing code assignments can also change their distributions and associations between training and testing. In HalfCheetah, a cue predicts reward direction on training tasks and reverses on held-out tasks. It offers a possible explanation for the negative returns, although the policy's reliance on that cue has not been measured.

These experiments establish a benefit for supplied aligned codes under the tested conditions. End-to-end control with autonomously discovered maps and isolated dimension-permutation effects remain open questions. The task families are constructed simulator studies, so the results do not establish transfer to arbitrary robots or new physical factor values.

</section>

<section id="references" class="references">

## References

1. <span id="ref-crl"></span>Schölkopf et al. (2021). [Toward Causal Representation Learning](https://doi.org/10.1109/JPROC.2021.3058954). Proceedings of the IEEE.
2. <span id="ref-identification"></span>Locatello et al. (2019). [Challenging Common Assumptions in the Unsupervised Learning of Disentangled Representations](https://proceedings.mlr.press/v97/locatello19a.html). ICML.
3. <span id="ref-cc"></span>Sontakke, Mehrjou, Itti, and Schölkopf (2021). [Causal Curiosity: RL Agents Discovering Self-supervised Experiments for Causal Representation Learning](https://proceedings.mlr.press/v139/sontakke21a.html). ICML.

</section>

<p class="status report-status">Near completion · Planned submissions to top-tier ML conferences in 2027</p>
