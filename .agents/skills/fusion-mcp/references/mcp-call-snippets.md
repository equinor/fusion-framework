# MCP JSON-RPC payload snippets

Use these snippets when users need direct MCP requests without local helper scripts.

Each example includes:
- short purpose
- request payload JSON
- expected return shape

## `initialize`

Initialize an MCP session and receive capabilities/instructions.

```json
{
	"jsonrpc": "2.0",
	"id": 1,
	"method": "initialize",
	"params": {
		"protocolVersion": "2024-11-05",
		"clientInfo": {
			"name": "fusion-mcp-snippets",
			"version": "0.0.0-dev"
		}
	}
}
```

```json
{
	"jsonrpc": "2.0",
	"id": 1,
	"result": {
		"protocolVersion": "2024-11-05",
		"capabilities": { "tools": {} },
		"instructions": "..."
	}
}
```

## `tools/list`

List all available MCP tools exposed by the server.

```json
{
	"jsonrpc": "2.0",
	"id": 2,
	"method": "tools/list",
	"params": {}
}
```

```json
{
	"jsonrpc": "2.0",
	"id": 2,
	"result": {
		"tools": [
			{ "name": "search_index" },
			{ "name": "search_indexes_describe" },
			{ "name": "search_metadata_types" },
			{ "name": "skills" }
		]
	}
}
```

## `tools/call` → `search_indexes_describe`

Get configured indexes and basic routing guidance.

```json
{
	"jsonrpc": "2.0",
	"id": 3,
	"method": "tools/call",
	"params": {
		"name": "search_indexes_describe",
		"arguments": {
			"includeMarkdown": false
		}
	}
}
```

```json
{
	"jsonrpc": "2.0",
	"id": 3,
	"result": {
		"content": [
			{ "type": "text", "text": "..." }
		],
		"structuredContent": {
			"indexes": [
				{ "name": "fusion-docs" },
				{ "name": "fusion-framework" }
			]
		}
	}
}
```

## `tools/call` → `search_index`

Run retrieval against a target Fusion index.

```json
{
	"jsonrpc": "2.0",
	"id": 4,
	"method": "tools/call",
	"params": {
		"name": "search_index",
		"arguments": {
			"index": "fusion-framework",
			"query": "service discovery",
			"top": 5
		}
	}
}
```

```json
{
	"jsonrpc": "2.0",
	"id": 4,
	"result": {
		"content": [
			{ "type": "text", "text": "..." }
		],
		"structuredContent": {
			"index": "fusion-framework",
			"query": "service discovery",
			"result": []
		}
	}
}
```

## `tools/call` → `search_metadata_types`

Summarize metadata-type distribution for a query.

```json
{
	"jsonrpc": "2.0",
	"id": 5,
	"method": "tools/call",
	"params": {
		"name": "search_metadata_types",
		"arguments": {
			"index": "fusion-docs",
			"query": "*",
			"top": 20
		}
	}
}
```

```json
{
	"jsonrpc": "2.0",
	"id": 5,
	"result": {
		"content": [
			{ "type": "text", "text": "..." }
		],
		"structuredContent": {
			"metadataTypes": [
				{ "type": "markdown", "count": 20 }
			]
		}
	}
}
```

## `tools/call` → `skills`

Get skill recommendations and lifecycle advisory guidance.

```json
{
	"jsonrpc": "2.0",
	"id": 6,
	"method": "tools/call",
	"params": {
		"name": "skills",
		"arguments": {
			"query": "is there a fusion skill for helping me write issues",
			"top": 5
		}
	}
}
```

```json
{
	"jsonrpc": "2.0",
	"id": 6,
	"result": {
		"content": [
			{ "type": "text", "text": "..." }
		],
		"structuredContent": {
			"intent": "research",
			"primarySkill": { "name": "..." },
			"advisory": { "mode": "instructions-only" }
		}
	}
}
```

