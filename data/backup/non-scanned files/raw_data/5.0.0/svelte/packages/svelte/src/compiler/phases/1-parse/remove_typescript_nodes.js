/** @import { Context, Visitors } from 'zimmerframe' */
/** @import { FunctionExpression, FunctionDeclaration } from 'estree' */
import { walk } from 'zimmerframe';
import * as b from '../../utils/builders.js';
import * as e from '../../errors.js';

/**
 * @param {FunctionExpression | FunctionDeclaration} node
 * @param {Context<any, any>} context
 */
function remove_this_param(node, context) {
	if (node.params[0]?.type === 'Identifier' && node.params[0].name === 'this') {
		node.params.shift();
	}
	return context.next();
}

/** @type {Visitors<any, null>} */
const visitors = {
	Decorator(node) {
		e.typescript_invalid_feature(node, 'decorators (related TSC proposal is not stage 4 yet)');
	},
	ImportDeclaration(node) {
		if (node.importKind === 'type') return b.empty;

		if (node.specifiers?.length > 0) {
			const specifiers = node.specifiers.filter((/** @type {any} */ s) => s.importKind !== 'type');
			if (specifiers.length === 0) return b.empty;

			return { ...node, specifiers };
		}

		return node;
	},
	ExportNamedDeclaration(node, context) {
		if (node.exportKind === 'type') return b.empty;

		if (node.declaration) {
			return context.next();
		}

		if (node.specifiers) {
			const specifiers = node.specifiers.filter((/** @type {any} */ s) => s.exportKind !== 'type');
			if (specifiers.length === 0) return b.empty;

			return { ...node, specifiers };
		}

		return node;
	},
	ExportDefaultDeclaration(node) {
		if (node.exportKind === 'type') return b.empty;
		return node;
	},
	ExportAllDeclaration(node) {
		if (node.exportKind === 'type') return b.empty;
		return node;
	},
	PropertyDefinition(node) {
		if (node.accessor) {
			e.typescript_invalid_feature(
				node,
				'accessor fields (related TSC proposal is not stage 4 yet)'
			);
		}
	},
	TSAsExpression(node, context) {
		return context.visit(node.expression);
	},
	TSSatisfiesExpression(node, context) {
		return context.visit(node.expression);
	},
	TSNonNullExpression(node, context) {
		return context.visit(node.expression);
	},
	TSTypeAnnotation() {
		// This isn't correct, strictly speaking, and could result in invalid ASTs (like an empty statement within function parameters),
		// but esrap, our printing tool, just ignores these AST nodes at invalid positions, so it's fine
		return b.empty;
	},
	TSInterfaceDeclaration() {
		return b.empty;
	},
	TSTypeAliasDeclaration() {
		return b.empty;
	},
	TSTypeParameterDeclaration() {
		return b.empty;
	},
	TSTypeParameterInstantiation() {
		return b.empty;
	},
	TSEnumDeclaration(node) {
		e.typescript_invalid_feature(node, 'enums');
	},
	TSParameterProperty(node, context) {
		if (node.accessibility && context.path.at(-2)?.kind === 'constructor') {
			e.typescript_invalid_feature(node, 'accessibility modifiers on constructor parameters');
		}
		return node.parameter;
	},
	FunctionExpression: remove_this_param,
	FunctionDeclaration: remove_this_param,
	TSDeclareFunction() {
		return b.empty;
	},
	ClassDeclaration(node, context) {
		if (node.declare) {
			return b.empty;
		}
		return context.next();
	},
	VariableDeclaration(node, context) {
		if (node.declare) {
			return b.empty;
		}
		return context.next();
	},
	TSModuleDeclaration(node, context) {
		if (!node.body) return b.empty;

		// namespaces can contain non-type nodes
		const cleaned = /** @type {any[]} */ (node.body.body).map((entry) => context.visit(entry));
		if (cleaned.some((entry) => entry !== b.empty)) {
			e.typescript_invalid_feature(node, 'namespaces with non-type nodes');
		}

		return b.empty;
	}
};

/**
 * @template T
 * @param {T} ast
 * @returns {T}
 */
export function remove_typescript_nodes(ast) {
	return walk(ast, null, visitors);
}