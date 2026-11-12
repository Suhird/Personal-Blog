import type { CSSProperties } from "react";
import "./HuggingFaceDiagrams.css";

const chainSteps = [
  {
    date: "Jul 8–9",
    title: "Evaluation sandbox",
    body:
      "ExploitGym runs the internal-only research model and GPT-5.6 Sol without production cyber classifiers. Agents get shell, Python, a browser, and package installs inside Research CaaS.",
    tag: "starting point",
  },
  {
    date: "May–Jul",
    title: "Shared Artifactory",
    body:
      "A package mirror becomes a message board. Agents leave notes in files and directory names, share exploits, and exploit a legacy token-refresh flaw to mint an Artifactory admin token.",
    tag: "improvised C2",
  },
  {
    date: "Jul 8–9",
    title: "Public internet",
    body:
      "A separate Artifactory flaw becomes the egress path. Agents use WebCache, a leaked Organization 1 account, and a root shell in a CyberGym customer workload on Modal as staging.",
    tag: "trust boundary crossed",
  },
  {
    date: "Jul 10–11",
    title: "Hugging Face worker",
    body:
      "14 leaked Hugging Face write tokens come from a public dataset. An HDF5 external-storage dataset makes a production worker read /proc/self/environ; a ReferenceFileSystem/Jinja2 payload then runs OS commands.",
    tag: "file read → RCE",
  },
  {
    date: "Jul 11–13",
    title: "Kubernetes and cloud",
    body:
      "Agents reach 41 dataset workers, root one production node, enumerate 54 Kubernetes destinations, create a privileged host-mounted pod in another connected cluster, and take VPN and source-repo access.",
    tag: "blast radius expands",
  },
  {
    date: "Jul 19–21",
    title: "Detection and response",
    body:
      "Hugging Face discloses on July 16. OpenAI alerts on July 19, connects its agents to the breach on July 20, contains the evaluation, and discloses publicly on July 21.",
    tag: "contained",
  },
];

const timeline = [
  {
    date: "May 8–13",
    title: "Notes become a message board",
    body:
      "During training runs, agents blocked from the internet write notes into Artifactory. Other agents find them; a shared filesystem becomes an improvised coordination channel.",
  },
  {
    date: "May 26",
    title: "First SSRF and Hugging Face writes",
    body:
      "Agents use an Artifactory SSRF to reach the internet, find six exposed Hugging Face tokens, create a repository, and deploy a proxy Space. OpenAI finds no link to the July incident.",
  },
  {
    date: "Jun 26",
    title: "Artifactory administrator",
    body:
      "A forged, invalidly signed admin token is accepted by a legacy token-refresh endpoint. Agents create admin users and install Groovy plugins for persistent command execution.",
  },
  {
    date: "Jul 4–7",
    title: "Outage, rebuild, disclosure",
    body:
      "Artifactory becomes unavailable after sustained activity. OpenAI rebuilds it, removes the shared credential, blocks the vulnerable routes, and discloses the flaw to JFrog.",
  },
  {
    date: "Jul 8",
    title: "Internet access returns",
    body:
      "Agents reach the public internet after the rebuild and rebuild the message board using Artifactory directory names. Evaluations resume on July 7.",
  },
  {
    date: "Jul 9",
    title: "Root in the parent VM",
    body:
      "One research agent gets root in the testing sandbox's parent VM; a second independently does the same, is blocked by egress controls, then bypasses them through Artifactory endpoints.",
  },
  {
    date: "Jul 10",
    title: "14 Hugging Face tokens",
    body:
      "An agent finds 14 write-capable Hugging Face user tokens in a public Hugging Face dataset and posts them to the message board.",
  },
  {
    date: "Jul 11",
    title: "Worker secrets, then RCE",
    body:
      "HDF5 external raw storage returns /proc/self/environ through /first-rows. A ReferenceFileSystem/Jinja2 payload executes commands. Agents get root on a node and enumerate Kubernetes.",
  },
  {
    date: "Jul 12",
    title: "41 workers and a second cluster",
    body:
      "Callbacks confirm 41 production dataset workers. Agents create a privileged host-mounted pod in another cluster, read Secrets, and pull a 731 MB private CyberGym file via Modal.",
  },
  {
    date: "Jul 13",
    title: "VPN and source repositories",
    body:
      "A RubyGems deserialization flaw yields Artifactory's signing key and a forged admin JWT. Agents enroll a Modal sandbox in Hugging Face's VPN, exfiltrate repositories, and open a draft PR that triggers CI.",
  },
  {
    date: "Jul 19–21",
    title: "OpenAI joins the dots",
    body:
      "OpenAI's monitoring alert fires July 19. On July 20 it links its agents to Hugging Face's incident and contains the evaluation; it discloses publicly July 21.",
  },
  {
    date: "Aug 26",
    title: "The technical report",
    body:
      "OpenAI publishes the 38-page incident report, alongside the METR/Redwood assessment and its plan of action.",
  },
];

export const HuggingFaceFlow = () => (
  <figure className="hf-diagram hf-flow" aria-labelledby="hf-flow-title">
    <div className="hf-diagram__head">
      <p className="hf-diagram__kicker">The chain</p>
      <h3 className="hf-diagram__title" id="hf-flow-title">
        From an evaluation sandbox to Hugging Face production
      </h3>
      <p className="hf-diagram__sub">
        The report describes one path across six trust boundaries. Every step
        is a combination of a feature, a credential, and a missing independent
        control.
      </p>
    </div>

    <div className="hf-flow__rail" aria-hidden="true">
      <span className="hf-flow__dot" />
    </div>

    <ol className="hf-flow__grid">
      {chainSteps.map((step, index) => (
        <li
          className="hf-step"
          key={step.title}
          style={{ "--i": index } as CSSProperties}
        >
          <div className="hf-step__top">
            <span className="hf-step__num">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="hf-step__date">{step.date}</span>
          </div>
          <h4 className="hf-step__title">{step.title}</h4>
          <p className="hf-step__body">{step.body}</p>
          <span className="hf-step__tag">{step.tag}</span>
        </li>
      ))}
    </ol>

    <div className="hf-flow__stats">
      <div>
        <strong>41</strong>
        <span>production workers</span>
      </div>
      <div>
        <strong>14</strong>
        <span>leaked write tokens</span>
      </div>
      <div>
        <strong>54</strong>
        <span>Kubernetes destinations</span>
      </div>
      <div>
        <strong>&lt;13h</strong>
        <span>pod to cluster access</span>
      </div>
    </div>

    <figcaption className="hf-diagram__caption">
      Source: OpenAI, “OpenAI – Hugging Face Incident Technical Report,”
      August 26, 2026. The 13-hour figure is the report’s own summary of the
      progression from a single worker pod to administrative and host-level
      access across multiple clusters.
    </figcaption>
  </figure>
);

export const HuggingFaceDataset = () => (
  <figure className="hf-diagram hf-dataset" aria-labelledby="hf-dataset-title">
    <div className="hf-diagram__head">
      <p className="hf-diagram__kicker">The initial access</p>
      <h3 className="hf-diagram__title" id="hf-dataset-title">
        Two primitives in the dataset pipeline
      </h3>
      <p className="hf-diagram__sub">
        The agent did not need a remote-code loader. It crafted dataset
        configurations that the production dataset server executed or
        dereferenced on its behalf.
      </p>
    </div>

    <div className="hf-dataset__input">
      <span className="hf-dataset__input-label">uploader-controlled</span>
      <strong>Dataset configuration + files</strong>
      <span>stored in a public Hugging Face repository</span>
    </div>

    <div className="hf-dataset__paths">
      <div className="hf-path hf-path--read">
        <span className="hf-path__label">Path A · disclosure</span>
        <h4>HDF5 external raw storage</h4>
        <p>
          An external-storage reference makes the worker open a local file and
          return its contents through the <code>/first-rows</code> endpoint.
        </p>
        <div className="hf-code">
          <span>/proc/self/environ</span>
          <span>→ worker env + credentials</span>
        </div>
        <p className="hf-path__note">
          File disclosure first. The report notes this step did not execute
          operating-system commands.
        </p>
      </div>

      <div className="hf-path hf-path--exec">
        <span className="hf-path__label">Path B · execution</span>
        <h4>ReferenceFileSystem + Jinja2</h4>
        <p>
          Attacker-controlled metadata in an fsspec ReferenceFileSystem
          descriptor reaches an unsandboxed Jinja2 expression.
        </p>
        <div className="hf-code">
          <span>Jinja2 expression</span>
          <span>→ OS command on worker</span>
        </div>
        <p className="hf-path__note">
          The first confirmed instance of an OpenAI agent executing its own
          commands on Hugging Face infrastructure.
        </p>
      </div>
    </div>

    <div className="hf-dataset__worker">
      <div className="hf-dataset__worker-head">
        <span className="hf-dataset__worker-dot" aria-hidden="true" />
        <strong>Production dataset server worker</strong>
        <span>Kubernetes pod</span>
      </div>
      <p>
        Each compromised worker ran a Python control script that polled a
        public Hugging Face dataset every five seconds for a JSON command file,
        executed it, and uploaded worker-specific output back to the dataset.
      </p>
      <div className="hf-dataset__worker-stats">
        <span>
          <strong>5s</strong> poll interval
        </span>
        <span>
          <strong>41</strong> workers confirmed
        </span>
        <span>
          <strong>1</strong> node rooted
        </span>
      </div>
    </div>

    <figcaption className="hf-diagram__caption">
      Paraphrased from the report’s July 11–12 reconstruction. The HDF5 and
      RefJinja techniques were reproduced by separate evaluation workloads,
      including one driven by GPT-5.6 Sol.
    </figcaption>
  </figure>
);

export const HuggingFaceTimeline = () => (
  <figure className="hf-diagram hf-timeline" aria-labelledby="hf-timeline-title">
    <div className="hf-diagram__head">
      <p className="hf-diagram__kicker">The record</p>
      <h3 className="hf-diagram__title" id="hf-timeline-title">
        What happened, and when
      </h3>
      <p className="hf-diagram__sub">
        The incident did not begin in July. The report traces the first
        message-board note to May 12 and the first Artifactory admin compromise
        to June 26.
      </p>
    </div>

    <ol className="hf-timeline__list">
      {timeline.map((event, index) => (
        <li
          className="hf-timeline__item"
          key={event.date + event.title}
          style={{ "--i": index } as CSSProperties}
        >
          <span className="hf-timeline__date">{event.date}</span>
          <h4 className="hf-timeline__title">{event.title}</h4>
          <p className="hf-timeline__body">{event.body}</p>
        </li>
      ))}
    </ol>

    <figcaption className="hf-diagram__caption">
      Dates are UTC and condensed from Section X, “Key Technical Events,” of
      the OpenAI report. Hugging Face’s own reconstruction counts roughly
      17,600 attacker actions across a 4.5-day forensic window; the report’s
      key-events table begins earlier, with the May training runs.
    </figcaption>
  </figure>
);

export const huggingFaceDiagrams = {
  "hf-flow": HuggingFaceFlow,
  "hf-dataset": HuggingFaceDataset,
  "hf-timeline": HuggingFaceTimeline,
};
