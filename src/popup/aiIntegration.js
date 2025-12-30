// Exports:
// makeCohereRequestWithPermission(apiKey, payload),
// makeCohereRequest(apiKey, question)
// fetchCodeFromContentScript()

// Small helper used by the popup "Attach Page Code" button.
export async function fetchCodeFromContentScript() {
	const code = await new Promise((resolve) => {
		try {
			chrome.tabs.query({ active: true, currentWindow: true },
				(tabs) => {
					if (Array.isArray(tabs) && tabs.length) {
						const activeTab = tabs[0];
						chrome.tabs.sendMessage(
							activeTab.id,
							{ type: "GET_USER_CODE" },
							(response) => {
								// If no content script is injected in this tab,
								// Chrome will set runtime.lastError.
								if (chrome.runtime && chrome.runtime.lastError) {
									console.warn(
										"[AI Helper] Could not reach content script:",
										chrome.runtime.lastError.message
									);
									resolve(null);
									return;
								}
								if (response && response.type === "USER_CODE" && response.code != null) {
									resolve(response.code);
								} else {
									resolve(null);
								}
							}
						);
					} else {
						resolve(null);
					}
				});
		} catch (e) {
			resolve(null);
		}
	});

	if (code == null) {
		return { success: false, error: "no_code" };
	}
	return { success: true, data: { code } };
}

export function makeCohereRequest(apiKey, question) {
	const apiUrl = 'https://api.cohere.ai/v1/chat';
	const data = {
		model: 'command-a-03-2025',
		message: question,
		temperature: 0.7,
		k: 0,
		p: 0.1,
		frequency_penalty: 0,
		presence_penalty: 0,
		stop_sequences: []
	};

	return fetch(apiUrl, {
		method: 'POST',
		headers: {
			'Authorization': `Bearer ${apiKey}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	})
		.then(async (response) => {
			let body = null;
			try { body = await response.json(); } catch (e) { body = null; }

			if (!response.ok) {
				const errMsg = body && (body.error || body.message) ? (body.error || body.message) : `HTTP ${response.status}`;
				return { success: false, error: errMsg, status: response.status, body };
			}

			const text = body?.text ?? body?.output ?? (Array.isArray(body?.outputs) && body.outputs[0]?.content) ?? (typeof body === 'string' ? body : JSON.stringify(body));
			return { success: true, text };
		})
		.catch((error) => {
			return { success: false, error: error && error.message ? error.message : String(error) };
		});
}

export async function makeCohereRequestWithPermission(apiKey, payload) {
	return new Promise((resolve) => {
		try {
			chrome.permissions.contains({ origins: ["https://api.cohere.ai/*"] }, async (hasPermission) => {
				if (hasPermission) {
					resolve(await makeCohereRequest(apiKey, payload));
				} else {
					chrome.permissions.request({ origins: ["https://api.cohere.ai/*"] }, async (granted) => {
						if (granted) {
							resolve(await makeCohereRequest(apiKey, payload));
						} else {
							resolve({ success: false, error: 'permission_denied' });
						}
					});
				}
			});
		} catch (e) {
			resolve({ success: false, error: String(e) });
		}
	});
}
