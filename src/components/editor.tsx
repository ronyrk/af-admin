"use client";
import { defaultEditorContent } from "@/lib/content";
import React, { HTMLAttributes, useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { Separator } from "@/components/ui/separator"

import {
	defaultEditorProps,
	// EditorInstance,
	EditorRoot,
	EditorBubble,
	EditorCommand,
	EditorCommandItem,
	EditorCommandEmpty,
	EditorContent,
	type JSONContent,
	Editor,
} from "novel";
import { ImageResizer } from "novel/extensions";
import { NodeSelector } from "./selectors/node-selector";
import { LinkSelector } from "./selectors/link-selector";
import { ColorSelector } from "./selectors/color-selector";

import { TextButtons } from "./selectors/text-buttons";
import { slashCommand, suggestionItems } from "./slash-command";
import { defaultExtensions } from "@/lib/extenstion";


const extensions = [...defaultExtensions, slashCommand];

const TailwindEditor = ({ description, value, onChange }: { description: string, value: string, onChange: (richText: string) => void }) => {
	const [initialContent, setInitialContent] = useState<null | JSONContent>(
		null,
	);
	const [saveStatus, setSaveStatus] = useState("Saved");

	const [openNode, setOpenNode] = useState(false);
	const [openColor, setOpenColor] = useState(false);
	const [openLink, setOpenLink] = useState(false);

	const debouncedUpdates = useDebouncedCallback(
		async (editor: Editor) => {
			const json = editor.getJSON();
			const html = editor.getHTML();
			onChange(`${html}^${JSON.stringify(json)}`);
			// console.log(`${html}^${JSON.stringify(json)}`, 'result')

			window.localStorage.setItem("content", JSON.stringify(json));
			setSaveStatus("Saved");
		},
		500,
	);

	useEffect(() => {
		const content = window.localStorage.getItem("content-1");
		if (content) setInitialContent(JSON.parse(content));
		else setInitialContent(defaultEditorContent);
	}, []);

	if (!initialContent) return null;

	return (
		<div className="relative w-full max-w-screen-lg">
			<div className="absolute right-5 top-5 z-10 mb-5 rounded-lg bg-accent px-2 py-1 text-sm text-muted-foreground">
				{saveStatus}
			</div>
			<EditorRoot>
				<EditorContent
					initialContent={initialContent}
					extensions={extensions}
					className="relative min-h-[400px] w-full max-w-screen-lg border-muted bg-background sm:mb-[calc(5vh)] sm:rounded-lg sm:border sm:shadow-lg p-4"
					editorProps={{
						...defaultEditorProps,
						attributes: {
							class: `prose-lg prose-stone dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full`,
						},
					}}
					onUpdate={({ editor }) => {
						debouncedUpdates(editor);
						setSaveStatus("Unsaved");
					}}
					slotAfter={<ImageResizer />}
				>
					<EditorCommand className="z-50 h-auto max-h-[330px]  w-72 overflow-y-auto rounded-md border border-muted bg-background px-1 py-2 shadow-md transition-all">
						<EditorCommandEmpty className="px-2 text-muted-foreground">
							No results
						</EditorCommandEmpty>
						{suggestionItems.map((item: any) => (
							<EditorCommandItem
								value={item.title}
								onCommand={(val: any) => item?.command(val)}
								className={`flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-accent aria-selected:bg-accent `}
								key={item.title}
							>
								<div className="flex h-10 w-10 items-center justify-center rounded-md border border-muted bg-background">
									{item.icon}
								</div>
								<div>
									<p className="font-medium">{item.title}</p>
									<p className="text-xs text-muted-foreground">
										{item.description}
									</p>
								</div>
							</EditorCommandItem>
						))}
					</EditorCommand>

					<EditorBubble
						tippyOptions={{
							placement: "top",
						}}
						className="flex w-fit max-w-[90vw] overflow-hidden rounded border border-muted bg-background shadow-xl"
					>
						<Separator orientation="vertical" />
						<NodeSelector open={openNode} onOpenChange={setOpenNode} />
						<Separator orientation="vertical" />

						<LinkSelector open={openLink} onOpenChange={setOpenLink} />
						<Separator orientation="vertical" />
						<TextButtons />
						<Separator orientation="vertical" />
						<ColorSelector open={openColor} onOpenChange={setOpenColor} />
					</EditorBubble>
				</EditorContent>
			</EditorRoot>
		</div>
	);
};

export default TailwindEditor;