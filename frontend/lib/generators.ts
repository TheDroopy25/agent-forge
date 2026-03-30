import type { AgentState } from '../store/agentStore';

// ─── Utility helpers ──────────────────────────────────────────────────────────

/** Map a 0–100 slider value to a 0.0–1.0 float (2 decimal places). */
function sliderToFloat(value: number): string {
  return (value / 100).toFixed(2);
}

/** Map verbosity slider to a descriptive label. */
function verbosityLabel(value: number): string {
  if (value < 34) return 'terse';
  if (value < 67) return 'balanced';
  return 'verbose';
}

/** Map tone slider to a descriptive label. */
function toneLabel(value: number): string {
  if (value < 34) return 'formal';
  if (value < 67) return 'balanced';
  return 'casual';
}

/** Map humor slider to a descriptive label. */
function humorLabel(value: number): string {
  if (value < 34) return 'serious';
  if (value < 67) return 'balanced';
  return 'witty';
}

/** Map assertiveness slider to a descriptive label. */
function assertivenessLabel(value: number): string {
  if (value < 34) return 'passive';
  if (value < 67) return 'balanced';
  return 'opinionated';
}

/** Indent every line of a string by N spaces. */
function indent(text: string, spaces: number): string {
  const pad = ' '.repeat(spaces);
  return text
    .split('\n')
    .map((line) => (line.trim() === '' ? '' : pad + line))
    .join('\n');
}

/** Wrap text in a YAML block scalar (literal block). */
function yamlLiteral(text: string, indentSpaces = 4): string {
  return indent(text.trim(), indentSpaces);
}

/** Render a YAML list from a string array. Returns empty string if array is empty. */
function yamlList(items: string[], indentSpaces: number): string {
  if (items.length === 0) return indent('[]', indentSpaces);
  return items.map((item) => ' '.repeat(indentSpaces) + `- ${item}`).join('\n');
}

/** Return a LangChain import line based on the LLM provider. */
function llmImport(provider: string): string {
  switch (provider) {
    case 'anthropic':
      return 'from langchain_anthropic import ChatAnthropic';
    case 'google':
      return 'from langchain_google_genai import ChatGoogleGenerativeAI';
    case 'mistral':
      return 'from langchain_mistralai import ChatMistralAI';
    case 'ollama':
      return 'from langchain_ollama import ChatOllama';
    case 'nvidia':
      return 'from langchain_nvidia_ai_endpoints import ChatNVIDIA';
    case 'openai':
    default:
      return 'from langchain_openai import ChatOpenAI';
  }
}

/** Return the LangChain class name based on the LLM provider. */
function llmClassName(provider: string): string {
  switch (provider) {
    case 'anthropic':
      return 'ChatAnthropic';
    case 'google':
      return 'ChatGoogleGenerativeAI';
    case 'mistral':
      return 'ChatMistralAI';
    case 'ollama':
      return 'ChatOllama';
    case 'nvidia':
      return 'ChatNVIDIA';
    case 'openai':
    default:
      return 'ChatOpenAI';
  }
}

/** Collect enabled tool names from the tools state. */
function enabledTools(tools: AgentState['tools']): string[] {
  const mapping: Array<[keyof Omit<AgentState['tools'], 'customMcpUrl'>, string]> = [
    ['webSearch', 'web_search'],
    ['codeExecution', 'code_execution'],
    ['fileSystem', 'file_system'],
    ['browserControl', 'browser_control'],
    ['terminal', 'terminal'],
    ['imageAnalysis', 'image_analysis'],
    ['pdfReader', 'pdf_reader'],
    ['calendar', 'calendar'],
    ['email', 'email'],
    ['customMcp', 'custom_mcp'],
  ];
  return mapping.filter(([key]) => tools[key as keyof typeof tools] === true).map(([, name]) => name);
}

/** Collect enabled skill names. */
function enabledSkills(skills: AgentState['skills']): string[] {
  return (Object.keys(skills) as Array<keyof AgentState['skills']>).filter((k) => skills[k] === true);
}

// ─── 1. OpenClaw YAML ─────────────────────────────────────────────────────────

export function generateOpenClawYAML(state: AgentState): string {
  const { identity, llm, voice, memory, tools, skills, channels, guardrails, observability, targetOS } = state;

  // OS-specific path note
  const osPathNote =
    targetOS === 'windows'
      ? '# Config path (Windows): %APPDATA%\\openclaw\\'
      : targetOS
      ? '# Config path (Mac/Linux): ~/.openclaw/'
      : '# Config path: ~/.openclaw/ (Mac/Linux) or %APPDATA%\\openclaw\\ (Windows)';

  const agentName = identity.name || 'Unnamed Agent';

  // Fallback chain block
  const fallbackChainBlock =
    llm.fallbackChain.length > 0
      ? llm.fallbackChain
          .map(
            (f) =>
              `    - provider: ${f.provider}\n      model: ${f.model}\n      on: ${f.trigger}`
          )
          .join('\n')
      : '    []';

  // Tools list
  const toolList = enabledTools(tools);
  const toolsBlock =
    toolList.length > 0
      ? toolList.map((t) => `  - ${t}`).join('\n')
      : '  []';

  // Custom MCP URL
  const mcpUrlLine = tools.customMcp && tools.customMcpUrl ? `\n  custom_mcp_url: "${tools.customMcpUrl}"` : '';

  // Skills list
  const skillList = enabledSkills(skills);
  const skillsBlock =
    skillList.length > 0
      ? skillList.map((s) => `  - ${s}`).join('\n')
      : '  []';

  // Memory blocks
  const memoryLines: string[] = [];
  if (memory.shortTerm.enabled) {
    memoryLines.push(`  short_term:\n    enabled: true\n    window: ${memory.shortTerm.turns}`);
  }
  if (memory.longTerm.enabled) {
    memoryLines.push(`  long_term:\n    enabled: true\n    vector_store: ${memory.longTerm.vectorStore}`);
  }
  if (memory.episodic.enabled) {
    const pathLine = memory.episodic.filePath ? `\n    file_path: "${memory.episodic.filePath}"` : '';
    memoryLines.push(`  episodic:\n    enabled: true${pathLine}`);
  }
  if (memory.workingMemory.enabled) {
    const pathLine = memory.workingMemory.filePath ? `\n    file_path: "${memory.workingMemory.filePath}"` : '';
    memoryLines.push(`  working_memory:\n    enabled: true${pathLine}`);
  }
  if (memory.externalDb.enabled) {
    const connLine = memory.externalDb.connectionString
      ? `\n    connection_string: "${memory.externalDb.connectionString}"`
      : '';
    memoryLines.push(`  external_db:\n    enabled: true${connLine}`);
  }
  const memoryBlock = memoryLines.length > 0 ? memoryLines.join('\n') : '  {}';

  // Channels block
  const channelLines: string[] = [];
  if (channels.discord.enabled) {
    channelLines.push(
      `  discord:\n    enabled: true\n    token: "${channels.discord.token}"\n    guild_id: "${channels.discord.guildId}"`
    );
  }
  if (channels.cliOnly) {
    channelLines.push(`  cli_only: true`);
  }
  channelLines.push(`  primary: ${channels.primaryChannel}`);
  const channelsBlock = channelLines.join('\n');

  // Guardrails
  const neverDoBlock =
    guardrails.neverDo.length > 0
      ? guardrails.neverDo.map((r) => `    - "${r}"`).join('\n')
      : '    []';
  const alwaysAskBlock =
    guardrails.alwaysAsk.length > 0
      ? guardrails.alwaysAsk.map((r) => `    - "${r}"`).join('\n')
      : '    []';

  // Observability
  const heartbeatLine =
    observability.heartbeatInterval !== 'disabled'
      ? `  heartbeat_interval: ${observability.heartbeatInterval}`
      : `  heartbeat_interval: disabled`;
  const tracePathLine = observability.traceOutputPath
    ? `\n  trace_output_path: "${observability.traceOutputPath}"`
    : '';
  const discordAlertLine = observability.discordAlertChannel
    ? `\n  discord_alert_channel: "${observability.discordAlertChannel}"`
    : '';

  return `# Generated by AgentForge
# https://github.com/openclaw/agent-forge
${osPathNote}

agent:
  name: "${agentName}"
  avatar: "${identity.avatar}"
  purpose: |
    ${identity.purpose.trim() || '(no purpose specified)'}
  personality:
    verbosity: ${sliderToFloat(identity.verbosity)}   # ${verbosityLabel(identity.verbosity)}
    tone: ${toneLabel(identity.tone)}
    humor: ${humorLabel(identity.humor)}
    assertiveness: ${assertivenessLabel(identity.assertiveness)}

brain:
  provider: ${llm.provider || 'openai'}
  model: ${llm.model || 'gpt-4o'}
  temperature: ${llm.temperature}
  fallback_chain:
${fallbackChainBlock}

voice:
  enabled: ${voice.enabled}
  provider: ${voice.provider}
  voice_id: "${voice.voiceId}"
  speed: ${voice.speed}
  style: ${voice.style}

memory:
${memoryBlock}

tools:
${toolsBlock}${mcpUrlLine}

skills:
${skillsBlock}

channels:
${channelsBlock}

guardrails:
  never_do:
${neverDoBlock}
  always_ask:
${alwaysAskBlock}
  cost_limit_usd: ${guardrails.costLimit}
  token_budget: ${guardrails.tokenBudget}
  hard_stop_path: "${guardrails.hardStopPath}"
  max_tool_calls: ${guardrails.maxToolCalls}

observability:
  log_level: ${observability.logLevel}
  ${heartbeatLine}${tracePathLine}${discordAlertLine}
  daily_summary: ${observability.dailySummary}
  context_compression: ${observability.contextCompression}
`;
}

// ─── 2. SOUL.md ───────────────────────────────────────────────────────────────

export function generateSOUL(state: AgentState): string {
  const { identity, guardrails } = state;
  const agentName = identity.name || 'Unnamed Agent';

  // Personality prose
  const verbosity = verbosityLabel(identity.verbosity);
  const tone = toneLabel(identity.tone);
  const humor = humorLabel(identity.humor);
  const assertiveness = assertivenessLabel(identity.assertiveness);

  const personalityProse = `${agentName} communicates in a ${tone} register, keeping responses ${verbosity}. \
${identity.humor >= 67 ? 'Humor is a natural part of the conversation — wit is welcome and encouraged.' : identity.humor >= 34 ? 'A measured sense of humor is appropriate; levity is used sparingly.' : 'Communication is earnest and straightforward; humor is rarely used.'} \
${identity.assertiveness >= 67 ? 'Opinions are stated clearly and confidently. The agent will push back when warranted.' : identity.assertiveness >= 34 ? 'Positions are held with reasonable confidence, yielding to good arguments.' : 'The agent defers to the user and avoids strong opinions unless directly asked.'}`;

  // Core values derived from never_do / always_ask
  const coreValuesSection: string[] = [];
  if (guardrails.neverDo.length > 0) {
    coreValuesSection.push('### Hard Limits\n');
    coreValuesSection.push(guardrails.neverDo.map((r) => `- ${r}`).join('\n'));
  }
  if (guardrails.alwaysAsk.length > 0) {
    coreValuesSection.push('\n### Always Confirm Before\n');
    coreValuesSection.push(guardrails.alwaysAsk.map((r) => `- ${r}`).join('\n'));
  }
  if (coreValuesSection.length === 0) {
    coreValuesSection.push('No explicit constraints defined. Default ethical standards apply.');
  }

  // Communication style prose
  const styleNotes: string[] = [];
  styleNotes.push(`- **Verbosity:** ${verbosity} (${identity.verbosity}/100) — ${verbosity === 'terse' ? 'answers are direct and minimal' : verbosity === 'verbose' ? 'answers are thorough and detailed' : 'answers balance completeness with conciseness'}`);
  styleNotes.push(`- **Tone:** ${tone} — ${tone === 'formal' ? 'professional language, avoids contractions and slang' : tone === 'casual' ? 'relaxed language, contractions and colloquialisms are fine' : 'approachable but professional'}`);
  styleNotes.push(`- **Humor:** ${humor} — ${humor === 'witty' ? 'embraces wordplay and levity' : humor === 'serious' ? 'avoids jokes' : 'occasional light humor when appropriate'}`);
  styleNotes.push(`- **Assertiveness:** ${assertiveness} — ${assertiveness === 'opinionated' ? 'forms and defends clear positions' : assertiveness === 'passive' ? 'asks clarifying questions, rarely volunteers strong opinions' : 'balances own perspective with user input'}`);

  return `# ${agentName} — SOUL

> *This document defines the soul, character, and core identity of ${agentName}.*
> *Generated by AgentForge.*

---

## Identity

- **Name:** ${agentName}
- **Avatar:** ${identity.avatar}
- **Role:** AI Agent

---

## Purpose

${identity.purpose.trim() || '*No purpose has been defined yet.*'}

---

## Personality Profile

${personalityProse}

### Sliders at a Glance

| Trait | Value | Label |
|-------|-------|-------|
| Verbosity | ${identity.verbosity}/100 | ${verbosity} |
| Tone | ${identity.tone}/100 | ${tone} |
| Humor | ${identity.humor}/100 | ${humor} |
| Assertiveness | ${identity.assertiveness}/100 | ${assertiveness} |

---

## Core Values

${coreValuesSection.join('\n')}

---

## Communication Style

${styleNotes.join('\n')}

---

*Last generated: ${new Date().toISOString().split('T')[0]}*
`;
}

// ─── 3. AGENTS.md ─────────────────────────────────────────────────────────────

export function generateAGENTS(state: AgentState): string {
  const { identity, tools, memory, channels, guardrails, llm, targetOS } = state;

  // OS-specific path note
  const osConfigPath =
    targetOS === 'windows'
      ? '`%APPDATA%\\openclaw\\`'
      : targetOS
      ? '`~/.openclaw/`'
      : '`~/.openclaw/` (Mac/Linux) or `%APPDATA%\\openclaw\\` (Windows)';
  const agentName = identity.name || 'Unnamed Agent';

  // Tools section
  const toolList = enabledTools(tools);
  const toolsSection =
    toolList.length > 0
      ? toolList.map((t) => `- \`${t}\``).join('\n')
      : '_No tools enabled._';
  const mcpNote =
    tools.customMcp && tools.customMcpUrl
      ? `\n\n**Custom MCP Endpoint:** \`${tools.customMcpUrl}\``
      : '';

  // Memory section
  const memoryItems: string[] = [];
  if (memory.shortTerm.enabled) memoryItems.push(`- **Short-term memory** — sliding window of ${memory.shortTerm.turns} turns`);
  if (memory.longTerm.enabled) memoryItems.push(`- **Long-term memory** — vector store: \`${memory.longTerm.vectorStore}\``);
  if (memory.episodic.enabled) {
    const path = memory.episodic.filePath ? ` (\`${memory.episodic.filePath}\`)` : '';
    memoryItems.push(`- **Episodic memory**${path}`);
  }
  if (memory.workingMemory.enabled) {
    const path = memory.workingMemory.filePath ? ` (\`${memory.workingMemory.filePath}\`)` : '';
    memoryItems.push(`- **Working memory**${path}`);
  }
  if (memory.externalDb.enabled) {
    memoryItems.push(`- **External database** — connection string configured`);
  }
  const memorySection = memoryItems.length > 0 ? memoryItems.join('\n') : '_No memory layers enabled._';

  // Channels section
  const channelItems: string[] = [];
  if (channels.discord.enabled) channelItems.push(`- **Discord** — Guild: \`${channels.discord.guildId || 'not set'}\``);
  if (channels.cliOnly) channelItems.push(`- **CLI only** — no external channel`);
  channelItems.push(`\n**Primary channel:** \`${channels.primaryChannel}\``);
  const channelsSection = channelItems.join('\n');

  // Constraints section
  const constraintItems: string[] = [
    `- **Cost limit:** $${guardrails.costLimit} USD`,
    `- **Token budget:** ${guardrails.tokenBudget.toLocaleString()} tokens`,
    `- **Max tool calls per turn:** ${guardrails.maxToolCalls}`,
    `- **Hard stop file:** \`${guardrails.hardStopPath}\``,
  ];
  if (guardrails.neverDo.length > 0) {
    constraintItems.push('\n**Never do:**');
    guardrails.neverDo.forEach((r) => constraintItems.push(`- ${r}`));
  }
  if (guardrails.alwaysAsk.length > 0) {
    constraintItems.push('\n**Always confirm before:**');
    guardrails.alwaysAsk.forEach((r) => constraintItems.push(`- ${r}`));
  }

  return `# ${agentName} — Workspace Instructions

> *This document describes ${agentName}'s capabilities, constraints, and architecture.*
> *Generated by AgentForge. Do not edit manually — regenerate via AgentForge.*
> *Config path: ${osConfigPath}*

---

## Model

- **Provider:** ${llm.provider || 'not configured'}
- **Model:** ${llm.model || 'not configured'}
- **Temperature:** ${llm.temperature}
${llm.fallbackChain.length > 0 ? `- **Fallback chain:** ${llm.fallbackChain.map((f) => `${f.provider}/${f.model}`).join(' → ')}` : ''}

---

## Available Tools

${toolsSection}${mcpNote}

---

## Memory Architecture

${memorySection}

---

## Channels

${channelsSection}

---

## Constraints

${constraintItems.join('\n')}

---

*Last generated: ${new Date().toISOString().split('T')[0]}*
`;
}

// ─── 4. Python (LangGraph skeleton) ──────────────────────────────────────────

export function generatePython(state: AgentState): string {
  const { identity, llm, memory, tools, skills, channels, guardrails, observability } = state;
  const agentName = identity.name || 'Unnamed Agent';
  const safeName = agentName.replace(/[^a-zA-Z0-9_]/g, '_');

  const importLine = llmImport(llm.provider || 'openai');
  const className = llmClassName(llm.provider || 'openai');
  const modelValue = llm.model || 'gpt-4o';
  const tempValue = llm.temperature;

  // Tool list for Python
  const toolList = enabledTools(tools);
  const toolListStr =
    toolList.length > 0
      ? `[\n    ${toolList.map((t) => `"${t}"`).join(',\n    ')},\n]`
      : '[]';

  // Memory imports
  const memoryImports: string[] = [];
  if (memory.shortTerm.enabled) {
    memoryImports.push('from langchain.memory import ConversationBufferWindowMemory');
  }
  if (memory.longTerm.enabled) {
    const storeImport =
      memory.longTerm.vectorStore === 'chromadb'
        ? 'from langchain_chroma import Chroma'
        : memory.longTerm.vectorStore === 'pinecone'
        ? 'from langchain_pinecone import PineconeVectorStore'
        : `# Vector store: ${memory.longTerm.vectorStore} — add appropriate import`;
    memoryImports.push(storeImport);
  }

  // Memory setup block
  const memorySetupLines: string[] = [];
  if (memory.shortTerm.enabled) {
    memorySetupLines.push(
      `short_term_memory = ConversationBufferWindowMemory(\n    k=${memory.shortTerm.turns},\n    return_messages=True,\n    memory_key="chat_history",\n)`
    );
  }
  if (memory.longTerm.enabled) {
    if (memory.longTerm.vectorStore === 'chromadb') {
      memorySetupLines.push(
        `vector_store = Chroma(\n    collection_name="${safeName}_memory",\n    embedding_function=embeddings,\n)`
      );
    } else if (memory.longTerm.vectorStore === 'pinecone') {
      memorySetupLines.push(
        `vector_store = PineconeVectorStore(\n    index_name="${safeName}_memory",\n    embedding=embeddings,\n)`
      );
    }
  }

  // Skills as comments
  const skillList = enabledSkills(skills);
  const skillsComment =
    skillList.length > 0
      ? `# Skills: ${skillList.join(', ')}\n# Load skill integrations from openclaw.skills`
      : '# No skills enabled';

  // Channel setup
  const channelSetupLines: string[] = [];
  if (channels.discord.enabled) {
    channelSetupLines.push(
      `# Discord integration\nimport discord\nDISCORD_TOKEN = os.environ.get("DISCORD_TOKEN", "${channels.discord.token || ''}")\nDISCORD_GUILD_ID = "${channels.discord.guildId || ''}"`
    );
  }

  // Guardrails as constants
  const neverDoStr =
    guardrails.neverDo.length > 0
      ? `[\n    ${guardrails.neverDo.map((r) => `"${r}"`).join(',\n    ')},\n]`
      : '[]';
  const alwaysAskStr =
    guardrails.alwaysAsk.length > 0
      ? `[\n    ${guardrails.alwaysAsk.map((r) => `"${r}"`).join(',\n    ')},\n]`
      : '[]';

  // System prompt from soul
  const systemPrompt = [
    `You are ${agentName}.`,
    identity.purpose ? identity.purpose.trim() : '',
    '',
    `Tone: ${toneLabel(identity.tone)}. Verbosity: ${verbosityLabel(identity.verbosity)}. Humor: ${humorLabel(identity.humor)}. Assertiveness: ${assertivenessLabel(identity.assertiveness)}.`,
    guardrails.neverDo.length > 0
      ? `\nYou must NEVER:\n${guardrails.neverDo.map((r) => `- ${r}`).join('\n')}`
      : '',
    guardrails.alwaysAsk.length > 0
      ? `\nAlways confirm before:\n${guardrails.alwaysAsk.map((r) => `- ${r}`).join('\n')}`
      : '',
  ]
    .filter(Boolean)
    .join('\n')
    .replace(/\\/g, '\\\\')
    .replace(/"""/g, '\\"\\"\\"');

  const memoryImportBlock = memoryImports.length > 0 ? memoryImports.join('\n') + '\n' : '';
  const memorySetupBlock = memorySetupLines.length > 0 ? '\n' + memorySetupLines.join('\n\n') + '\n' : '';
  const channelSetupBlock = channelSetupLines.length > 0 ? '\n\n' + channelSetupLines.join('\n\n') : '';

  return `"""
${agentName} — Generated by AgentForge
Provider: ${llm.provider || 'openai'} | Model: ${modelValue}
Generated: ${new Date().toISOString().split('T')[0]}
"""

import os
import operator
from typing import TypedDict, Annotated, Sequence

${importLine}
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage
from langchain_core.tools import tool
${memoryImportBlock}

# ─── Configuration ────────────────────────────────────────────────────────────

AGENT_NAME = "${agentName}"
MODEL = "${modelValue}"
TEMPERATURE = ${tempValue}
COST_LIMIT_USD = ${guardrails.costLimit}
TOKEN_BUDGET = ${guardrails.tokenBudget}
MAX_TOOL_CALLS = ${guardrails.maxToolCalls}
HARD_STOP_PATH = os.path.expanduser("${guardrails.hardStopPath}")
LOG_LEVEL = "${observability.logLevel}"

# ─── Guardrails ───────────────────────────────────────────────────────────────

NEVER_DO = ${neverDoStr}
ALWAYS_ASK = ${alwaysAskStr}

# ─── System Prompt ────────────────────────────────────────────────────────────

SYSTEM_PROMPT = """${systemPrompt}"""

# ─── State Schema ─────────────────────────────────────────────────────────────

class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], operator.add]
    memory: dict
    context: dict
    tool_call_count: int
    total_tokens: int

# ─── LLM ─────────────────────────────────────────────────────────────────────

llm = ${className}(model=MODEL, temperature=TEMPERATURE)

# ─── Tools ───────────────────────────────────────────────────────────────────

ENABLED_TOOLS = ${toolListStr}

${skillsComment}


@tool
def check_hard_stop() -> str:
    """Check if a hard stop file exists and halt if so."""
    if os.path.exists(HARD_STOP_PATH):
        return "HARD_STOP: Stop file detected. Halting agent."
    return "ok"


# Register tools — replace stubs with real LangChain tool implementations
tools: list = [check_hard_stop]
# Example: from langchain_community.tools import DuckDuckGoSearchRun
# if "web_search" in ENABLED_TOOLS: tools.append(DuckDuckGoSearchRun())

llm_with_tools = llm.bind_tools(tools)

# ─── Memory Setup ─────────────────────────────────────────────────────────────
${memorySetupBlock}
# ─── Channel Setup ────────────────────────────────────────────────────────────
${channelSetupBlock}

# ─── Graph Nodes ──────────────────────────────────────────────────────────────

def should_continue(state: AgentState) -> str:
    """Decide whether to continue to tool execution or end."""
    messages = state["messages"]
    last = messages[-1] if messages else None

    # Hard stop check
    if os.path.exists(HARD_STOP_PATH):
        return "end"

    # Budget guard
    if state.get("tool_call_count", 0) >= MAX_TOOL_CALLS:
        return "end"
    if state.get("total_tokens", 0) >= TOKEN_BUDGET:
        return "end"

    if hasattr(last, "tool_calls") and last.tool_calls:  # type: ignore[union-attr]
        return "tools"
    return "end"


def call_model(state: AgentState) -> dict:
    """Invoke the LLM with the current message history."""
    messages = [SystemMessage(content=SYSTEM_PROMPT)] + list(state["messages"])
    response = llm_with_tools.invoke(messages)
    return {
        "messages": [response],
        "tool_call_count": state.get("tool_call_count", 0),
        "total_tokens": state.get("total_tokens", 0) + getattr(response, "response_metadata", {}).get("token_usage", {}).get("total_tokens", 0),
    }


# ─── Build Graph ──────────────────────────────────────────────────────────────

tool_node = ToolNode(tools)

workflow = StateGraph(AgentState)
workflow.add_node("agent", call_model)
workflow.add_node("tools", tool_node)

workflow.set_entry_point("agent")
workflow.add_conditional_edges(
    "agent",
    should_continue,
    {"tools": "tools", "end": END},
)
workflow.add_edge("tools", "agent")

graph = workflow.compile()

# ─── Entry Point ──────────────────────────────────────────────────────────────

def run(user_input: str, context: dict | None = None) -> str:
    """Run the agent with a user message and return the final response."""
    initial_state: AgentState = {
        "messages": [HumanMessage(content=user_input)],
        "memory": {},
        "context": context or {},
        "tool_call_count": 0,
        "total_tokens": 0,
    }
    result = graph.invoke(initial_state)
    messages = result.get("messages", [])
    if messages:
        last = messages[-1]
        return last.content if hasattr(last, "content") else str(last)
    return ""


if __name__ == "__main__":
    import sys
    prompt = " ".join(sys.argv[1:]) if len(sys.argv) > 1 else "Hello! What can you help me with?"
    print(f"[{AGENT_NAME}] {run(prompt)}")
`;
}
