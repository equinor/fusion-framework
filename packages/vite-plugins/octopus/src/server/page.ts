/**
 * Renders the Octopus overview page. The page loads the registry from `/api/apps`, refreshes
 * itself, and can unregister apps.
 *
 * @returns The page as HTML.
 */
export const renderPage = (): string => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Octopus</title>
<style>
  body { font-family: system-ui, sans-serif; margin: 2rem; color: #222; }
  h1 { margin: 0 0 0.25rem; }
  p.lead { margin: 0 0 1.5rem; color: #555; }
  table { border-collapse: collapse; width: 100%; }
  th, td { text-align: left; padding: 0.5rem 0.75rem; border-bottom: 1px solid #ddd; }
  th { font-size: 0.8rem; text-transform: uppercase; color: #666; }
  .mock { background: #fff2c6; color: #6b5200; padding: 0.1rem 0.5rem; border-radius: 1rem; font-size: 0.8rem; }
  .empty { color: #777; padding: 1rem 0.75rem; }
  button { cursor: pointer; }
</style>
</head>
<body>
<h1>Octopus</h1>
<p class="lead">Apps served locally. The portal loads these from their dev server; all other apps come from CI.</p>
<table>
  <thead>
    <tr><th>App</th><th>Address</th><th>Mode</th><th>Registered</th><th>Last heartbeat</th><th></th></tr>
  </thead>
  <tbody id="apps"></tbody>
</table>
<script>
  const tbody = document.getElementById('apps');

  const cell = (content) => {
    const td = document.createElement('td');
    if (typeof content === 'string') td.textContent = content;
    else if (content) td.append(content);
    return td;
  };

  const link = (href) => {
    const a = document.createElement('a');
    a.href = href;
    a.textContent = href;
    a.target = '_blank';
    return a;
  };

  const secondsAgo = (time) => Math.max(0, Math.round((Date.now() - time) / 1000)) + ' s ago';

  const unregister = async (appKey) => {
    if (!confirm('Unregister ' + appKey + '? The portal loads it from CI until its dev server or Octopus restarts.')) return;
    await fetch('/api/apps/' + encodeURIComponent(appKey), { method: 'DELETE' });
    await refresh();
  };

  const refresh = async () => {
    const apps = await fetch('/api/apps').then((response) => response.json());
    const rows = apps.map((app) => {
      const tr = document.createElement('tr');
      let mode = 'Normal';
      if (app.mockUrl) {
        mode = document.createElement('span');
        mode.className = 'mock';
        mode.textContent = 'Mock';
        mode.title = 'Mock server ' + app.mockUrl + '. Inside the portal the app still uses real services.';
      }
      const button = document.createElement('button');
      button.textContent = 'Unregister';
      button.onclick = () => unregister(app.appKey);
      tr.append(
        cell(app.appKey),
        // The Fusion CLI serves the app's own dev page under /apps/<appKey>.
        cell(link(app.url + '/apps/' + encodeURIComponent(app.appKey))),
        cell(mode),
        cell(new Date(app.registeredAt).toLocaleTimeString()),
        cell(secondsAgo(app.lastSeen)),
        cell(button),
      );
      return tr;
    });
    if (rows.length === 0) {
      const td = cell('No apps registered. Start an app with pnpm dev to register it.');
      td.colSpan = 6;
      td.className = 'empty';
      const tr = document.createElement('tr');
      tr.append(td);
      rows.push(tr);
    }
    tbody.replaceChildren(...rows);
  };

  refresh();
  setInterval(refresh, 2000);
</script>
</body>
</html>
`;
