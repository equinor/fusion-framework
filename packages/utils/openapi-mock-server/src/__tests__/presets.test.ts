import { afterEach, describe, expect, it } from 'vitest';

import { createMockServer, type MockServerHandle } from '../server/index.js';
import { presets } from '../presets/index.js';
import { fusionPreset } from '../presets/fusion/index.js';

const fusionPresetServices = fusionPreset();

describe('presets', () => {
  it('registers the fusion preset under the "fusion" name', async () => {
    await expect(presets.fusion()).resolves.toEqual(fusionPresetServices);
  });

  it("covers Fusion's mandatory service-discovery keys, plus rolesv2", () => {
    // every registered service key, sorted for a stable comparison
    expect(Object.keys(fusionPresetServices).sort()).toEqual([
      'app-state',
      'apps',
      'bookmarks',
      'context',
      'notification',
      'people',
      'portal-config',
      'rolesv2',
    ]);
  });

  it('gives only people a field-faker map, for its function-valued avatarUrl faker', () => {
    // every other service's fakers are declared inline in its own .openapi.json document
    for (const [key, definition] of Object.entries(fusionPresetServices)) {
      if (key === 'people') {
        expect(definition.fields).toEqual({ 'SuggestionAccount.avatarUrl': expect.any(Function) });
      } else {
        expect(definition.fields).toBeUndefined();
      }
    }
  });

  describe('serving real operations', () => {
    let server: MockServerHandle | undefined;

    afterEach(async () => {
      await server?.close();
      server = undefined;
    });

    it('fakes a Context with a schema-shaped id and title', async () => {
      server = createMockServer().use('fusion');
      const { url } = await server.start();

      const response = await fetch(`${url}/context/contexts/00000000-0000-0000-0000-000000000000`);

      expect(response.status).toBe(200);
      const context = (await response.json()) as { id: string; title: string };
      expect(context.id).toMatch(/^[0-9a-f-]{36}$/i);
      expect(typeof context.title).toBe('string');
    });

    it('fakes a list of Bookmarks with faked names and descriptions', async () => {
      server = createMockServer().use('fusion');
      const { url } = await server.start();

      const response = await fetch(`${url}/bookmarks/persons/me/bookmarks`);

      expect(response.status).toBe(200);
      const bookmarks = (await response.json()) as Array<{ name: string; description: string }>;
      expect(bookmarks.length).toBeGreaterThan(0);
      // every faked bookmark should have a real string name and description
      for (const bookmark of bookmarks) {
        expect(typeof bookmark.name).toBe('string');
        expect(typeof bookmark.description).toBe('string');
      }
    });

    it('fakes a Person with an email-shaped mail field', async () => {
      server = createMockServer().use('fusion');
      const { url } = await server.start();

      const response = await fetch(`${url}/people/persons/00000000-0000-0000-0000-000000000000`);

      expect(response.status).toBe(200);
      const person = (await response.json()) as { mail: string };
      expect(person.mail).toContain('@');
    });

    it("reproduces the same faked Person after reset(), since the server's seed is fixed", async () => {
      server = createMockServer({ seed: 42 }).use('fusion');
      const { url } = await server.start();
      const path = `${url}/people/persons/00000000-0000-0000-0000-000000000000`;

      const before = await (await fetch(path)).json();
      await fetch(`${url}/@fusion-mock/reset`, { method: 'POST' });
      const after = await (await fetch(path)).json();

      expect(after).toEqual(before);
    });

    it('fakes the same Person for two servers given the same seed, a different one for a different seed', async () => {
      const seeded = createMockServer({ seed: 1 }).use('fusion');
      const sameSeed = createMockServer({ seed: 1 }).use('fusion');
      const differentSeed = createMockServer({ seed: 2 }).use('fusion');
      try {
        const path = '/people/persons/00000000-0000-0000-0000-000000000000';
        const seededUrl = (await seeded.start()).url;
        const sameSeedUrl = (await sameSeed.start()).url;
        const differentSeedUrl = (await differentSeed.start()).url;

        const seededPerson = await (await fetch(`${seededUrl}${path}`)).json();
        const sameSeedPerson = await (await fetch(`${sameSeedUrl}${path}`)).json();
        const differentSeedPerson = await (await fetch(`${differentSeedUrl}${path}`)).json();

        expect(sameSeedPerson).toEqual(seededPerson);
        expect(differentSeedPerson).not.toEqual(seededPerson);
      } finally {
        await Promise.all([seeded.close(), sameSeed.close(), differentSeed.close()]);
      }
    });

    it('fakes a list of Notifications with faked titles', async () => {
      server = createMockServer().use('fusion');
      const { url } = await server.start();

      const response = await fetch(
        `${url}/notification/person/00000000-0000-0000-0000-000000000000/notifications`,
      );

      expect(response.status).toBe(200);
      const notifications = (await response.json()) as Array<{ title: string }>;
      expect(notifications.length).toBeGreaterThan(0);
      // every faked notification should have a real string title
      for (const notification of notifications) {
        expect(typeof notification.title).toBe('string');
      }
    });

    it('fakes a list of AppStateSummary entries with no field-faker map', async () => {
      server = createMockServer().use('fusion');
      const { url } = await server.start();

      const response = await fetch(`${url}/app-state/persons/me/apps`);

      expect(response.status).toBe(200);
      const summaries = (await response.json()) as Array<{ appKey: string; documentCount: number }>;
      expect(summaries.length).toBeGreaterThan(0);
      // even with no field-faker map, ids/counters should still be schema-shaped
      for (const summary of summaries) {
        expect(typeof summary.appKey).toBe('string');
        expect(typeof summary.documentCount).toBe('number');
      }
    });

    it('fakes an AppManifest with a faked displayName', async () => {
      server = createMockServer().use('fusion');
      const { url } = await server.start();

      const response = await fetch(`${url}/apps/apps/some-app-key`);

      expect(response.status).toBe(200);
      const app = (await response.json()) as { appKey: string; displayName: string };
      expect(typeof app.appKey).toBe('string');
      expect(typeof app.displayName).toBe('string');
    });

    it('fakes a PortalManifest with a faked name', async () => {
      server = createMockServer().use('fusion');
      const { url } = await server.start();

      const response = await fetch(`${url}/portal-config/portals/some-portal`);

      expect(response.status).toBe(200);
      const portal = (await response.json()) as { name: string };
      expect(typeof portal.name).toBe('string');
    });
  });
});
