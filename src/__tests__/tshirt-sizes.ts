import {resolve} from 'node:path';
import {RuleTester} from 'eslint';
import rule from '../rules/tshirt-sizes';

const test = {
	valid: [
		// Asc (default)
		{code: 'var obj = { s: 1, m: 2, l: 3 }', options: []},
		{code: 'var obj = { xs: 0, m: 2, l: 3 }', options: []},
		{code: 'var obj = { xxs: 0, xs: 2, s: 3 }', options: []},
		// Desc
		{code: 'var obj = { l: 2, m: 1, s: 0 }', options: ['desc']},
		{code: 'var obj = { s: 2, xs: 1, xxs: 0 }', options: ['desc']},
		{code: 'var obj = { xxl: 2, xl: 1, l: 0 }', options: ['desc']},
	],
	invalid: [
		// Asc (default)
		{
			code: 'var obj = { s: 1, l: 3, m: 2 }',
			errors: ['Expected object keys to be in ascending T-shirt size order. \'m\' should be before \'l\'.'],
			output: 'var obj = { s: 1, m: 2, l: 3 }',
		},
		{
			code: 'var obj = { s: 0, xl: 3, l: 2 }',
			errors: ['Expected object keys to be in ascending T-shirt size order. \'l\' should be before \'xl\'.'],
			output: 'var obj = { s: 0, l: 2, xl: 3 }',
		},
		{
			code: 'var obj = { l: 1, xxl: 3, xl: 2 }',
			errors: ['Expected object keys to be in ascending T-shirt size order. \'xl\' should be before \'xxl\'.'],
			output: 'var obj = { l: 1, xl: 2, xxl: 3 }',
		},
		{
			code: 'var obj = { xs: 2, xxs: 1, s: 3 }',
			errors: ['Expected object keys to be in ascending T-shirt size order. \'xxs\' should be before \'xs\'.'],
			output: 'var obj = { xxs: 1, xs: 2, s: 3 }',
		},

		// Desc
		{
			code: 'var obj = { s: 0, m: 1, l: 2 }',
			options: ['desc'],
			errors: [
				'Expected object keys to be in descending T-shirt size order. \'m\' should be before \'s\'.',
				'Expected object keys to be in descending T-shirt size order. \'l\' should be before \'m\'.',
			],
			output: 'var obj = { m: 1, s: 0, l: 2 }',
		},
		{
			code: 'var obj = { xxs: 0, xs: 1 }',
			options: ['desc'],
			errors: ['Expected object keys to be in descending T-shirt size order. \'xs\' should be before \'xxs\'.'],
			output: 'var obj = { xs: 1, xxs: 0 }',
		},
	],
};

const ruleTester = new RuleTester();

ruleTester.run('tshirt-sizes', rule, test);

const babelRuleTester = new RuleTester({
	parser: resolve('node_modules/babel-eslint/lib/index.js'),
});

babelRuleTester.run('babel-eslint/tshirt-sizes', rule, test);
