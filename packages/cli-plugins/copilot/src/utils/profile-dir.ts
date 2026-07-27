import { homedir } from 'node:os';

/** Persistent Chrome profile directory used across agent-browser sessions. */
export const PROFILE_DIR = `${homedir()}/.fusion-smoke-profile`;
