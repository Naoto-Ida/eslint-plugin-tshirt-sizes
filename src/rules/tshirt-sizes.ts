import {getPropertyName} from 'eslint-utils';
import type {Rule} from 'eslint';
import * as ESTree from 'estree';

type Order = 'asc' | 'desc';
type SizePrefix = 'x';
type BaseSize = 's' | 'm' | 'l';
type PartObject = {
	prefix: string;
	baseSize: BaseSize;
};

const prefix: SizePrefix = 'x';
const baseSizes: BaseSize[] = ['s', 'm', 'l'];
const tshirtRegex = new RegExp(`(${prefix}+)?(${baseSizes.join('|')})$`);

function isSmaller(a: BaseSize, b: BaseSize) {
	switch (a) {
		case 's': {
			return b === 'm' || b === 'l';
		}

		case 'm': {
			return b === 'l';
		}

		default:
			return false;
	}
}

function extractParts(a: string, b: string) {
	const aParts = {} as PartObject;
	const bParts = {} as PartObject;

	const aPartsMatch = tshirtRegex.exec(a);
	const bPartsMatch = tshirtRegex.exec(b);

	if (aPartsMatch && aPartsMatch[2] !== undefined) {
		aParts.baseSize = aPartsMatch[2] as BaseSize;
		aParts.prefix = aPartsMatch[1];
	}

	if (bPartsMatch && bPartsMatch[2] !== undefined) {
		bParts.baseSize = bPartsMatch[2] as BaseSize;
		bParts.prefix = bPartsMatch[1];
	}

	return {
		aParts,
		bParts,
	};
}

function hasMorePrefixes(size: BaseSize, aPrefixes = '', bPrefixes = '') {
	if (size === 's') {
		return aPrefixes.length < bPrefixes.length;
	}

	return aPrefixes.length > bPrefixes.length;
}

const isValidOrders = {
	asc(a: string, b: string) {
		const {aParts, bParts} = extractParts(a, b);

		if (aParts.baseSize === bParts.baseSize) {
			return !hasMorePrefixes(aParts.baseSize, aParts.prefix, bParts.prefix);
		}

		return isSmaller(aParts.baseSize, bParts.baseSize);
	},
	desc(a: string, b: string) {
		const {aParts, bParts} = extractParts(a, b);

		if (aParts.baseSize === bParts.baseSize) {
			return hasMorePrefixes(aParts.baseSize, aParts.prefix, bParts.prefix);
		}

		return !isSmaller(aParts.baseSize, bParts.baseSize);
	},
};

export default {
	meta: {
		type: 'suggestion',
		fixable: 'code',
		docs: {
			description: 'require T-shirt sizes to be sorted',
			category: 'Stylistic Issues',
			recommended: false,
			url: 'https://github.com/Naoto-Ida/eslint-plugin-tshirt-sizes',
		},
		schema: [
			{
				enum: ['asc', 'desc'],
			},
		],
	},
	create(context) {
		const order: Order = (context.options[0] as Order) || 'asc';
		const isValidOrder = isValidOrders[order];

		let stack: {prevName: string; prevNode: ESTree.Node};

		const SpreadElement = (node: ESTree.SpreadElement & Rule.NodeParentExtension) => {
			if (node.parent.type === 'ObjectExpression') {
				stack.prevName = null;
			}
		};

		return {
			ExperimentalSpreadProperty: SpreadElement,

			ObjectExpression() {
				stack = {
					prevName: null,
					prevNode: null,
				};
			},
			SpreadElement,
			Property(node) {
				if (node.parent.type === 'ObjectPattern') {
					return;
				}

				const {prevName, prevNode} = stack;
				const thisName = getPropertyName(node);

				if (thisName !== null) {
					stack.prevName = thisName;
					stack.prevNode = node || prevNode;
				}

				if (prevName === null || thisName === null) {
					return;
				}

				if (!isValidOrder(prevName, thisName)) {
					context.report({
						node,
						loc: node.key.loc,
						message:
              'Expected object keys to be in {{order}}ending T-shirt size order. \'{{thisName}}\' should be before \'{{prevName}}\'.',
						data: {
							thisName,
							prevName,
							order,
						},
						fix(fixer) {
							const fixes: Rule.Fix[] = [];
							const sourceCode = context.getSourceCode();

							const moveProperty = (fromNode: ESTree.Node, toNode: ESTree.Node) => {
								const previousText = sourceCode.getText(fromNode);
								const thisComments = sourceCode.getCommentsBefore(fromNode);

								for (const thisComment of thisComments) {
									// @ts-expect-error Todo
									fixes.push(fixer.insertTextBefore(toNode, sourceCode.getText(thisComment) + '\n'));
									// @ts-expect-error Todo
									fixes.push(fixer.remove(thisComment));
								}

								fixes.push(fixer.replaceText(toNode, previousText));
							};

							moveProperty(node, prevNode);
							moveProperty(prevNode, node);

							return fixes;
						},
					});
				}
			},
		};
	},
} as Rule.RuleModule;
