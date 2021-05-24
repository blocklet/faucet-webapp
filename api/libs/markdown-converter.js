const unified = require('unified');
const markdown = require('remark-parse');
const toHAST = require('mdast-util-to-hast');
const defaultHandler = require('mdast-util-to-hast/lib/handlers/code');

const handler = (h, node) => {
  const result = defaultHandler(h, node);

  if (node.meta && result.children[0]) {
    result.children[0].properties.dataMeta = node.meta;
  }

  return result;
};

const convertMarkdownToHtmlAst = (markdownText) => {
  const ast = unified()
    .use(markdown)
    .parse(markdownText || '');

  return toHAST(ast, {
    allowDangerousHtml: true,
    handlers: { code: handler },
  });
};

module.exports = { convertMarkdownToHtmlAst };
