import { Command } from 'commander';
import { describe, expect, it } from 'vitest';

import mockServerPlugin from './index.js';

describe('mockServerPlugin', () => {
  it('registers a top-level "mock-server" command', () => {
    const program = new Command();

    mockServerPlugin()(program);

    // every registered command's name, to check "mock-server" is among them
    expect(program.commands.map((command) => command.name())).toContain('mock-server');
  });

  it('applies every --preset before any positional directory', () => {
    const program = new Command();
    mockServerPlugin()(program);
    // locate the command this plugin registered, by name
    const mockServerCommand = program.commands.find((command) => command.name() === 'mock-server');

    // parse() invokes the command's action; capture what it would pass to createMockServer via the parsed options
    const parsed = mockServerCommand?.parseOptions([
      '--preset=fusion',
      '--preset=extra',
      './mocks',
      './overrides',
    ]);

    expect(parsed?.operands).toEqual(['./mocks', './overrides']);
    expect(mockServerCommand?.opts().preset).toEqual(['fusion', 'extra']);
  });

  it('defaults to the "fusion" preset when --preset is omitted', () => {
    const program = new Command();
    mockServerPlugin()(program);
    // locate the command this plugin registered, by name
    const mockServerCommand = program.commands.find((command) => command.name() === 'mock-server');

    mockServerCommand?.parseOptions(['./mocks']);

    expect(mockServerCommand?.opts().preset).toEqual(['fusion']);
  });

  it('replaces the default preset instead of appending to it, on the first explicit --preset', () => {
    const program = new Command();
    mockServerPlugin()(program);
    // locate the command this plugin registered, by name
    const mockServerCommand = program.commands.find((command) => command.name() === 'mock-server');

    mockServerCommand?.parseOptions(['--preset=other', './mocks']);

    expect(mockServerCommand?.opts().preset).toEqual(['other']);
  });

  it('applies caller-provided defaults for preset, port, and host', () => {
    const program = new Command();
    mockServerPlugin({ preset: ['other'], port: 4010, host: '0.0.0.0' })(program);
    // locate the command this plugin registered, by name
    const mockServerCommand = program.commands.find((command) => command.name() === 'mock-server');

    mockServerCommand?.parseOptions([]);

    expect(mockServerCommand?.opts()).toEqual({ preset: ['other'], port: 4010, host: '0.0.0.0' });
  });

  it('lets an explicit flag override a caller-provided default', () => {
    const program = new Command();
    mockServerPlugin({ preset: ['other'], port: 4010 })(program);
    // locate the command this plugin registered, by name
    const mockServerCommand = program.commands.find((command) => command.name() === 'mock-server');

    mockServerCommand?.parseOptions(['--port=5000']);

    expect(mockServerCommand?.opts().port).toBe(5000);
  });
});
