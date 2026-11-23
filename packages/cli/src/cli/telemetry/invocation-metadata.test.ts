import { Command } from 'commander';
import { describe, expect, it } from 'vitest';

import { createMachineId } from './create-machine-id.js';
import { resolveExceptionType } from './resolve-exception-type.js';
import { resolveFusionEnvironment } from './resolve-fusion-environment.js';
import { resolveInvocationCommand } from './resolve-invocation-command.js';

const createProgram = (): Command => {
  const program = new Command('fusion-framework-cli').option('--debug');
  const app = program.command('app');
  app
    .command('build')
    .alias('b')
    .argument('[manifest]')
    .option('-e, --env <env>')
    .option('--token <token>')
    .option('--port [port]')
    .option('--silent');
  program.command('ai').command('chat').option('--model <model>');
  return program;
};

describe('resolveInvocationCommand', () => {
  it('keeps the static command path and option names, never values', () => {
    const result = resolveInvocationCommand(createProgram(), [
      'app',
      'b',
      './secret/path.json',
      '--token',
      'super-secret',
      '--env=fprd',
      '--port',
      '3000',
      '--silent',
      '--unknown=leak',
    ]);

    expect(result).toEqual({
      path: ['app', 'build'],
      optionNames: ['--env', '--port', '--silent', '--token'],
      kind: 'builtin',
    });
    expect(JSON.stringify(result)).not.toMatch(/secret|fprd|3000|leak|path\.json/);
  });

  it('does not mistake option values or passthrough args for commands', () => {
    const result = resolveInvocationCommand(createProgram(), [
      'app',
      '--debug',
      'build',
      '-e',
      'app',
      '--',
      '--token',
    ]);

    expect(result.path).toEqual(['app', 'build']);
    expect(result.optionNames).toEqual(['--debug', '--env']);
  });

  it('expands combined short flags and attached short values, never keeping values', () => {
    const program = createProgram();
    program.commands[0].commands[0].option('-d, --dry').option('-s, --strict');

    const grouped = resolveInvocationCommand(program, ['app', 'build', '-ds', '-efprd']);
    expect(grouped.optionNames).toEqual(['--dry', '--env', '--strict']);
    expect(JSON.stringify(grouped)).not.toContain('fprd');

    // A trailing value-taking short option reads its value from the next token.
    const trailing = resolveInvocationCommand(program, ['app', 'build', '-dse', 'app', 'x']);
    expect(trailing).toMatchObject({
      path: ['app', 'build'],
      optionNames: ['--dry', '--env', '--strict'],
    });
  });

  it('classifies plugin commands', () => {
    expect(resolveInvocationCommand(createProgram(), ['ai', 'chat', '--model', 'x'])).toEqual({
      path: ['ai', 'chat'],
      optionNames: ['--model'],
      kind: 'plugin',
    });
  });

  it('records help without a command', () => {
    expect(resolveInvocationCommand(createProgram(), ['-h'])).toEqual({
      path: [],
      optionNames: ['--help'],
      kind: 'builtin',
    });
  });
});

describe('resolveExceptionType', () => {
  it('returns the type name only', () => {
    /** Distinct error type used to verify that the message is not exported. */
    class TokenExpiredError extends Error {}
    expect(resolveExceptionType(new TokenExpiredError('token abc'))).toBe('TokenExpiredError');
    expect(resolveExceptionType('raw message')).toBe('string');
    expect(resolveExceptionType(null)).toBe('object');
  });
});

describe('resolveFusionEnvironment', () => {
  it('accepts only known environments', () => {
    expect(resolveFusionEnvironment(' FPRD ')).toBe('fprd');
    expect(resolveFusionEnvironment('https://example.com')).toBeUndefined();
    expect(resolveFusionEnvironment(undefined)).toBeUndefined();
  });
});

describe('createMachineId', () => {
  it('hashes the first external MAC, falling back to the host name', () => {
    const address = {
      address: '192.0.2.1',
      netmask: '255.255.255.0',
      family: 'IPv4',
      cidr: '192.0.2.1/24',
    } as const;
    const external = {
      lo: [{ ...address, internal: true, mac: '00:00:00:00:00:00' }],
      en0: [{ ...address, internal: false, mac: 'aa:bb:cc:dd:ee:ff' }],
    } satisfies Parameters<typeof createMachineId>[0];

    const id = createMachineId(external, 'my-host');
    expect(id).toMatch(/^[0-9a-f]{64}$/);
    expect(id).not.toContain('aa:bb');
    expect(createMachineId({}, 'my-host')).not.toBe(id);
    expect(createMachineId({}, 'my-host')).toBe(createMachineId({}, 'my-host'));
  });
});
