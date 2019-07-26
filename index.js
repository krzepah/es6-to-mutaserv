#!/usr/bin/env node

const process = require('process');
const fs = require('fs');
const { parse } = require('@babel/parser');
const generate = require('@babel/generator').default;
const ramda = require('ramda');

const [,,path] = process.argv;

// eslint-disable-next-line
fs.readFile(path, 'utf8', (err, contents) => {
	if (err) {
		// eslint-disable-next-line
		console.log(err)
	}
	else {
		const ast = parse(contents, {
			sourceType: 'module'
		});

		const imports = ramda.map(
			(el) => el.imported.loc.identifierName,
			ast.program.body[0].specifiers
		);
		ast.program.body.shift();
		ast.program.body.pop();

		let out = Object.assign(ast);
		out.program = ramda.map(
			(e) => {
				return e;
			},
			ast.program
		);
		const output = generate(
			out,
			{
				shouldPrintComment: () => false
			}
		);
		console.log(' ');
		let result = output.code;
		result = result.replace(/ = /g, ': ');
		result = result.replace(';', ',');
		result = result.replace(';', '');
		result = result.replace(/const /g, '');
		result = (ramda.map((e) => '	' + e, result.split('\n'))).join('\n');
		console.log('module.exports = ({ ' + imports.join(', ') + ' }) => ({');
		console.log(result);
		console.log('});');
	}
});
