import {
	App,
	PluginSettingTab,
	Setting,
	SettingDefinitionGroup,
	SettingDefinitionItem,
} from "obsidian";
import VaultRecallPlugin from "./main";

interface RenderDefinition {
	name: string;
	desc: string;
	aliases?: string[];
	render: (setting: Setting) => unknown;
}

interface SettingsSection {
	heading: string;
	items: RenderDefinition[];
}

export class VaultRecallSettingTab extends PluginSettingTab {
	plugin: VaultRecallPlugin;

	constructor(app: App, plugin: VaultRecallPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	// Obsidian 1.13+ renders these declaratively and indexes them for settings
	// search. Older versions ignore this method and call display() instead.
	getSettingDefinitions(): SettingDefinitionItem[] {
		return this.sections().map(
			(section): SettingDefinitionGroup => ({
				type: "group",
				heading: section.heading,
				items: section.items.map(({ render, ...item }) => ({
					...item,
					render: (setting: Setting) => {
						render(setting);
					},
				})),
			}),
		);
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		for (const section of this.sections()) {
			new Setting(containerEl).setName(section.heading).setHeading();
			for (const item of section.items) {
				item.render(
					new Setting(containerEl).setName(item.name).setDesc(item.desc),
				);
			}
		}
	}

	private sections(): SettingsSection[] {
		return [
			{
				heading: "Review",
				items: [
					{
						name: "Default folder",
						desc: 'Vault folder reviewed when you click the ribbon icon (e.g. "Lectures" or "Lectures/Biology").',
						render: (setting) =>
							setting.addText((text) =>
								text
									.setPlaceholder("Folder path")
									.setValue(this.plugin.settings.defaultFolder)
									.onChange(async (value) => {
										this.plugin.settings.defaultFolder =
											value.trim();
										await this.plugin.saveSettings();
										this.plugin.updateStatusBar();
									}),
							),
					},
					{
						name: "Review order",
						desc: "Due-date first reviews oldest-due notes first. Random shuffles the queue each session.",
						render: (setting) =>
							setting.addDropdown((drop) =>
								drop
									.addOption("due", "Due-date first")
									.addOption("random", "Random")
									.setValue(this.plugin.settings.reviewOrder)
									.onChange(async (value) => {
										this.plugin.settings.reviewOrder =
											value === "random" ? "random" : "due";
										await this.plugin.saveSettings();
									}),
							),
					},
					this.numberSetting(
						"Daily due review limit",
						"Maximum due cards per session. Set to 0 for no limit.",
						"0",
						"dailyLimit",
						0,
					),
					this.numberSetting(
						"New cards per session",
						"Maximum unseen notes introduced in each session.",
						"20",
						"newCardsPerSession",
						20,
					),
					this.numberSetting(
						"Leech threshold",
						"Notes that fail this many times will trigger a warning. Set to 0 to disable.",
						"8",
						"leechThreshold",
						0,
					),
				],
			},
			{
				heading: "AI quiz - bring your own key",
				items: [
					{
						name: "API key",
						desc: "OpenAI-compatible key. Stored in plaintext in your vault's plugin data folder. Do not use a key with an unlimited spend cap.",
						aliases: ["openai", "token"],
						render: (setting) => {
							setting.addText((text) => {
								text.inputEl.type = "password";
								text.setPlaceholder("sk-…")
									.setValue(this.plugin.settings.apiKey)
									.onChange(async (value) => {
										const nextKey = value.trim();
										if (nextKey !== this.plugin.settings.apiKey) {
											this.plugin.settings.aiPrivacyAccepted = false;
										}
										this.plugin.settings.apiKey = nextKey;
										await this.plugin.saveSettings();
									});
								setting.addExtraButton((button) =>
									button
										.setIcon("trash")
										.setTooltip("Clear API key")
										.onClick(async () => {
											this.plugin.settings.apiKey = "";
											this.plugin.settings.aiPrivacyAccepted = false;
											this.plugin.settings.aiTrustedOrigin = "";
											text.setValue("");
											await this.plugin.saveSettings();
										}),
								);
							});
						},
					},
					{
						name: "API base URL",
						desc: "Chat completions endpoint. Works with OpenAI, OpenRouter, Ollama, or any OpenAI-compatible API.",
						aliases: ["endpoint", "ollama", "openrouter"],
						render: (setting) =>
							setting.addText((text) =>
								text
									.setPlaceholder(
										"https://api.openai.com/v1/chat/completions",
									)
									.setValue(this.plugin.settings.apiBaseUrl)
									.onChange(async (value) => {
										this.plugin.settings.apiBaseUrl = value.trim();
										this.plugin.settings.aiTrustedOrigin = "";
										await this.plugin.saveSettings();
									}),
							),
					},
					{
						name: "Model",
						desc: 'Model name to request from the API (e.g. "gpt-4o-mini").',
						render: (setting) =>
							setting.addText((text) =>
								text
									.setPlaceholder("gpt-4o-mini")
									.setValue(this.plugin.settings.model)
									.onChange(async (value) => {
										this.plugin.settings.model = value.trim();
										await this.plugin.saveSettings();
									}),
							),
					},
					{
						name: "Custom quiz prompt",
						desc: "Instruction sent to the AI before each note. Leave blank to use the default (3 cloze deletions + 2 multiple-choice questions).",
						render: (setting) =>
							setting.addTextArea((text) =>
								text
									.setPlaceholder(
										"Generate 3 cloze deletions and 2 multiple choice questions based on this text.",
									)
									.setValue(this.plugin.settings.customPrompt)
									.onChange(async (value) => {
										this.plugin.settings.customPrompt = value;
										await this.plugin.saveSettings();
									}),
							),
					},
				],
			},
		];
	}

	private numberSetting(
		name: string,
		desc: string,
		placeholder: string,
		key: "dailyLimit" | "newCardsPerSession" | "leechThreshold",
		fallback: number,
	): RenderDefinition {
		return {
			name,
			desc,
			render: (setting) =>
				setting.addText((text) => {
					text.inputEl.type = "number";
					text.inputEl.min = "0";
					text.setPlaceholder(placeholder)
						.setValue(String(this.plugin.settings[key]))
						.onChange(async (value) => {
							const n = parseInt(value, 10);
							this.plugin.settings[key] =
								isNaN(n) || n < 0 ? fallback : n;
							await this.plugin.saveSettings();
						});
				}),
		};
	}
}
