import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// ─── State Shape ─────────────────────────────────────────────────────────────

export interface AgentState {
  // Identity
  identity: {
    name: string;
    avatar: string;
    purpose: string;
    verbosity: number;
    tone: number;
    humor: number;
    assertiveness: number;
  };

  // LLM/Brain
  llm: {
    provider: string;
    model: string;
    temperature: number;
    fallbackChain: Array<{
      provider: string;
      model: string;
      trigger: string;
    }>;
  };

  // Voice
  voice: {
    enabled: boolean;
    provider: string;
    voiceId: string;
    speed: number;
    style: string;
  };

  // Memory
  memory: {
    shortTerm: { enabled: boolean; turns: number };
    longTerm: { enabled: boolean; vectorStore: string };
    episodic: { enabled: boolean; filePath: string };
    workingMemory: { enabled: boolean; filePath: string };
    externalDb: { enabled: boolean; connectionString: string };
  };

  // Tools
  tools: {
    webSearch: boolean;
    codeExecution: boolean;
    fileSystem: boolean;
    browserControl: boolean;
    terminal: boolean;
    imageAnalysis: boolean;
    pdfReader: boolean;
    calendar: boolean;
    email: boolean;
    customMcp: boolean;
    customMcpUrl: string;
  };

  // Skills
  skills: {
    cronScheduler: boolean;
    weather: boolean;
    summarize: boolean;
    clawHub: boolean;
    webScraper: boolean;
    discord: boolean;
    github: boolean;
  };

  // Channels
  channels: {
    discord: { enabled: boolean; token: string; guildId: string; channelId: string };
    cliOnly: boolean;
    primaryChannel: string;
  };

  // Guardrails
  guardrails: {
    neverDo: string[];
    alwaysAsk: string[];
    costLimit: number;
    tokenBudget: number;
    hardStopPath: string;
    maxToolCalls: number;
  };

  // Observability
  observability: {
    logLevel: string;
    heartbeatInterval: string;
    traceOutputPath: string;
    discordAlertChannel: string;
    dailySummary: boolean;
    contextCompression: boolean;
  };

  // Target OS selected during onboarding
  targetOS: 'mac' | 'linux' | 'windows' | '';

  // Section completion tracking
  sectionComplete: Record<string, boolean>;

  // Computed
  completedCount: number;
  nextStep: string | null;
  agentNamed: boolean;

  // Visited sections tracking
  visitedSections: Record<string, boolean>;

  // UI state
  activeDrawer: string | null;
  setActiveDrawer: (drawer: string | null) => void;

  // Actions
  markVisited: (section: string) => void;
  setTargetOS: (os: 'mac' | 'linux' | 'windows') => void;
  setIdentity: (data: Partial<AgentState['identity']>) => void;
  setLLM: (data: Partial<AgentState['llm']>) => void;
  setVoice: (data: Partial<AgentState['voice']>) => void;
  setMemory: (data: Partial<AgentState['memory']>) => void;
  setTools: (data: Partial<AgentState['tools']>) => void;
  setSkills: (data: Partial<AgentState['skills']>) => void;
  setChannels: (data: Partial<AgentState['channels']>) => void;
  setGuardrails: (data: Partial<AgentState['guardrails']>) => void;
  setObservability: (data: Partial<AgentState['observability']>) => void;
  updateSectionComplete: (section: string, complete: boolean) => void;
}

// ─── Section Completion Logic ─────────────────────────────────────────────────

function computeSectionComplete(state: Omit<AgentState, 'sectionComplete' | 'completedCount' | 'nextStep' | 'agentNamed' | 'activeDrawer' | 'setActiveDrawer' | 'visitedSections' | 'targetOS' | keyof ActionKeys>): Record<string, boolean> {
  const { identity, llm, voice, memory, tools, skills, channels, guardrails, observability } = state;

  const anyMemoryEnabled =
    memory.shortTerm.enabled ||
    memory.longTerm.enabled ||
    memory.episodic.enabled ||
    memory.workingMemory.enabled ||
    memory.externalDb.enabled;

  const anyToolEnabled =
    tools.webSearch ||
    tools.codeExecution ||
    tools.fileSystem ||
    tools.browserControl ||
    tools.terminal ||
    tools.imageAnalysis ||
    tools.pdfReader ||
    tools.calendar ||
    tools.email ||
    tools.customMcp;

  const anySkillEnabled =
    skills.cronScheduler ||
    skills.weather ||
    skills.summarize ||
    skills.clawHub ||
    skills.webScraper ||
    skills.discord ||
    skills.github;

  const anyChannelEnabled =
    channels.discord.enabled ||
    channels.cliOnly;

  return {
    identity: identity.name.length > 0 && identity.purpose.length > 0,
    llm: llm.provider.length > 0 && llm.model.length > 0,
    voice: voice.enabled === true,
    memory: anyMemoryEnabled,
    tools: anyToolEnabled,
    skills: anySkillEnabled,
    channels: anyChannelEnabled,
    guardrails: guardrails.neverDo.length > 0 || guardrails.alwaysAsk.length > 0,
    observability:
      observability.heartbeatInterval !== 'disabled' ||
      observability.discordAlertChannel.length > 0 ||
      observability.dailySummary === true,
  };
}

// ─── Action keys type helper ──────────────────────────────────────────────────

type ActionKeys = {
  setIdentity: AgentState['setIdentity'];
  setLLM: AgentState['setLLM'];
  setVoice: AgentState['setVoice'];
  setMemory: AgentState['setMemory'];
  setTools: AgentState['setTools'];
  setSkills: AgentState['setSkills'];
  setChannels: AgentState['setChannels'];
  setGuardrails: AgentState['setGuardrails'];
  setObservability: AgentState['setObservability'];
  updateSectionComplete: AgentState['updateSectionComplete'];
  markVisited: AgentState['markVisited'];
  setTargetOS: AgentState['setTargetOS'];
};

// ─── Default State ────────────────────────────────────────────────────────────

const defaultIdentity: AgentState['identity'] = {
  name: '',
  avatar: '🤖',
  purpose: '',
  verbosity: 50,
  tone: 50,
  humor: 50,
  assertiveness: 50,
};

const defaultLLM: AgentState['llm'] = {
  provider: '',
  model: '',
  temperature: 0.7,
  fallbackChain: [],
};

const defaultVoice: AgentState['voice'] = {
  enabled: false,
  provider: 'elevenlabs',
  voiceId: 'Rachel',
  speed: 1.0,
  style: 'conversational',
};

const defaultMemory: AgentState['memory'] = {
  shortTerm: { enabled: true, turns: 50 },
  longTerm: { enabled: true, vectorStore: 'chromadb' },
  episodic: { enabled: true, filePath: '' },
  workingMemory: { enabled: true, filePath: '' },
  externalDb: { enabled: false, connectionString: '' },
};

const defaultTools: AgentState['tools'] = {
  webSearch: true,
  codeExecution: true,
  fileSystem: true,
  browserControl: true,
  terminal: true,
  imageAnalysis: true,
  pdfReader: true,
  calendar: true,
  email: true,
  customMcp: false,
  customMcpUrl: '',
};

const defaultSkills: AgentState['skills'] = {
  cronScheduler: true,
  weather: true,
  summarize: true,
  clawHub: true,
  webScraper: false,
  discord: false,
  github: false,
};

const defaultChannels: AgentState['channels'] = {
  discord: { enabled: false, token: '', guildId: '', channelId: '' },
  cliOnly: false,
  primaryChannel: 'cli',
};

const defaultGuardrails: AgentState['guardrails'] = {
  neverDo: [],
  alwaysAsk: [],
  costLimit: 10,
  tokenBudget: 100000,
  hardStopPath: '~/.openclaw/workspace/STOP',
  maxToolCalls: 20,
};

const defaultObservability: AgentState['observability'] = {
  logLevel: 'normal',
  heartbeatInterval: 'disabled',
  traceOutputPath: '',
  discordAlertChannel: '',
  dailySummary: false,
  contextCompression: true,
};

// ─── Clockwise step order (uses section node IDs) ────────────────────────────

export const STEP_ORDER = [
  'identity', 'llm', 'voice', 'memory', 'tools',
  'skills', 'channels', 'guardrails', 'observability',
] as const;

// Map section node IDs to sectionComplete keys where they differ
const SECTION_TO_STORE_KEY: Record<string, string> = {
};

// ─── Helper: recompute derived fields after any mutation ──────────────────────

function withDerived(state: Partial<AgentState>): Pick<AgentState, 'sectionComplete' | 'completedCount' | 'nextStep' | 'agentNamed'> {
  const rawComplete = computeSectionComplete({
    identity: (state.identity ?? defaultIdentity),
    llm: (state.llm ?? defaultLLM),
    voice: (state.voice ?? defaultVoice),
    memory: (state.memory ?? defaultMemory),
    tools: (state.tools ?? defaultTools),
    skills: (state.skills ?? defaultSkills),
    channels: (state.channels ?? defaultChannels),
    guardrails: (state.guardrails ?? defaultGuardrails),
    observability: (state.observability ?? defaultObservability),
  });

  const visitedSections = state.visitedSections ?? {};
  const sectionComplete = Object.fromEntries(
    Object.entries(rawComplete).map(([k, v]) => [k, v && (visitedSections[k] ?? false)])
  );

  const completedCount = Object.values(sectionComplete).filter(Boolean).length;

  const nextStep = STEP_ORDER.find(
    (key) => !sectionComplete[SECTION_TO_STORE_KEY[key] ?? key]
  ) ?? null;

  const identity = state.identity ?? defaultIdentity;
  const agentNamed = identity.name.length > 0;

  return { sectionComplete, completedCount, nextStep, agentNamed };
}

// ─── Store ────────────────────────────────────────────────────────────────────

const initialStateSlice = {
  identity: defaultIdentity,
  llm: defaultLLM,
  voice: defaultVoice,
  memory: defaultMemory,
  tools: defaultTools,
  skills: defaultSkills,
  channels: defaultChannels,
  guardrails: defaultGuardrails,
  observability: defaultObservability,
  visitedSections: {} as Record<string, boolean>,
  targetOS: '' as 'mac' | 'linux' | 'windows' | '',
};

const initialDerived = withDerived(initialStateSlice);

export const useAgentStore = create<AgentState>()(
  devtools(
    (set) => ({
      ...initialStateSlice,
      ...initialDerived,

      activeDrawer: null,
      setActiveDrawer: (drawer) => set({ activeDrawer: drawer }, false, 'setActiveDrawer'),

      markVisited: (section) =>
        set(
          (state) => {
            const next = { ...state, visitedSections: { ...state.visitedSections, [section]: true } };
            return { visitedSections: next.visitedSections, ...withDerived(next) };
          },
          false,
          'markVisited'
        ),

      setTargetOS: (os) => set({ targetOS: os }, false, 'setTargetOS'),

      setIdentity: (data) =>
        set(
          (state) => {
            const next = { ...state, identity: { ...state.identity, ...data } };
            return { identity: next.identity, ...withDerived(next) };
          },
          false,
          'setIdentity'
        ),

      setLLM: (data) =>
        set(
          (state) => {
            const next = { ...state, llm: { ...state.llm, ...data } };
            return { llm: next.llm, ...withDerived(next) };
          },
          false,
          'setLLM'
        ),

      setVoice: (data) =>
        set(
          (state) => {
            const next = { ...state, voice: { ...state.voice, ...data } };
            return { voice: next.voice, ...withDerived(next) };
          },
          false,
          'setVoice'
        ),

      setMemory: (data) =>
        set(
          (state) => {
            const next = { ...state, memory: { ...state.memory, ...data } };
            return { memory: next.memory, ...withDerived(next) };
          },
          false,
          'setMemory'
        ),

      setTools: (data) =>
        set(
          (state) => {
            const next = { ...state, tools: { ...state.tools, ...data } };
            return { tools: next.tools, ...withDerived(next) };
          },
          false,
          'setTools'
        ),

      setSkills: (data) =>
        set(
          (state) => {
            const next = { ...state, skills: { ...state.skills, ...data } };
            return { skills: next.skills, ...withDerived(next) };
          },
          false,
          'setSkills'
        ),

      setChannels: (data) =>
        set(
          (state) => {
            const next = { ...state, channels: { ...state.channels, ...data } };
            return { channels: next.channels, ...withDerived(next) };
          },
          false,
          'setChannels'
        ),

      setGuardrails: (data) =>
        set(
          (state) => {
            const next = { ...state, guardrails: { ...state.guardrails, ...data } };
            return { guardrails: next.guardrails, ...withDerived(next) };
          },
          false,
          'setGuardrails'
        ),

      setObservability: (data) =>
        set(
          (state) => {
            const next = { ...state, observability: { ...state.observability, ...data } };
            return { observability: next.observability, ...withDerived(next) };
          },
          false,
          'setObservability'
        ),

      updateSectionComplete: (section, complete) =>
        set(
          (state) => ({
            sectionComplete: { ...state.sectionComplete, [section]: complete },
            completedCount: Object.values({ ...state.sectionComplete, [section]: complete }).filter(Boolean).length,
          }),
          false,
          'updateSectionComplete'
        ),
    }),
    { name: 'AgentForge' }
  )
);
