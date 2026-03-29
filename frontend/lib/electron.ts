// ─── Types ────────────────────────────────────────────────────────────────────

export interface PrereqResult {
  node: boolean;
  nodeVersion: string;
  openclaw: boolean;
  openclawVersion: string;
}

export interface AgentDeployConfig {
  name: string;
  yaml: string;
  soul: string;
  agents: string;
  apiKey?: string;
  discordToken?: string;
}

export interface DeployResult {
  success: boolean;
  workspacePath?: string;
  error?: string;
}

export interface ElectronAPI {
  checkPrereqs: () => Promise<PrereqResult>;
  installOpenclaw: (onProgress: (message: string) => void) => Promise<{ success: boolean }>;
  deployAgent: (config: AgentDeployConfig) => Promise<DeployResult>;
  getAgentStatus: (agentName: string) => Promise<'running' | 'stopped' | 'unknown'>;
  stopAgent: (agentName: string) => Promise<{ success: boolean; error?: string }>;
  openExternal: (url: string) => Promise<void>;
  onDeployProgress: (callback: (message: string) => void) => () => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const isElectron: boolean =
  typeof window !== 'undefined' && !!window.electronAPI;

export const electronAPI: ElectronAPI | null =
  isElectron ? (window.electronAPI ?? null) : null;
