import type {Fragment, Node as ProseMirrorNode} from '@tiptap/pm/model'

const LIST_NODE_NAMES = ['bulletList', 'orderedList', 'taskList']

/**
 * Plain text for the clipboard that keeps the list markers ProseMirror's default
 * text serializer drops, so a copied bullet list pastes back as "- item" lines.
 */
export function fragmentToPlainText(content: Fragment): string {
	const lines: string[] = []
	content.forEach(node => collectBlock(node, lines))
	return lines.join('\n')
}

function isList(node: ProseMirrorNode): boolean {
	return LIST_NODE_NAMES.includes(node.type.name)
}

function collectBlock(node: ProseMirrorNode, lines: string[]) {
	if (isList(node)) {
		collectList(node, '', lines)
		return
	}

	if (node.isTextblock) {
		lines.push(node.textContent)
		return
	}

	node.forEach(child => collectBlock(child, lines))
}

function collectList(list: ProseMirrorNode, indent: string, lines: string[]) {
	let index = Number(list.attrs.start ?? 1)

	list.forEach(item => {
		const marker = list.type.name === 'orderedList' ? `${index++}. ` : '- '
		collectListItem(item, indent + marker, indent + ' '.repeat(marker.length), lines)
	})
}

function collectListItem(item: ProseMirrorNode, firstPrefix: string, restPrefix: string, lines: string[]) {
	let first = true

	item.forEach(child => {
		if (isList(child)) {
			collectList(child, restPrefix, lines)
			return
		}

		lines.push((first ? firstPrefix : restPrefix) + child.textContent)
		first = false
	})

	if (first) {
		lines.push(firstPrefix.trimEnd())
	}
}
