/**
 * Server entry for the message-editing plugin.
 *
 * This plugin is deliberately client-only: the visible Edit experience and the
 * branch-and-resubmit flow are implemented in `client.js`, using the public
 * `sessions` / `uiWorkspace` client services. The server entry exists so the
 * bundle can be loaded and so DSH serves the plugin's client module.
 */

export function apply() {
	// No server-side behavior.
}
