const { createMacro } = require("babel-plugin-macros")

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

module.exports = createMacro(({ references, babel }) => {
  const { types: t } = babel
  references.default.forEach(referencePath => {
    const callPath = referencePath.parentPath

    assert(
      t.isCallExpression(callPath.node),
      "return() must be called as a function."
    )

    const nullishPath = callPath.parentPath
    assert(
      t.isLogicalExpression(nullishPath.node, { operator: "??" }),
      "return() must be assigned to a LogicalExpression"
    )

    const declaratorPath = nullishPath.parentPath
    const declaratorNode = declaratorPath.node
    assert(
      t.isVariableDeclarator(declaratorNode),
      "return() must be assigned to a VariableDeclarator"
    )

    const { id } = declaratorNode

    assert(
      t.isIdentifier(id) ||
        (t.isObjectPattern(id) && id.properties.every(t.isObjectProperty)) ||
        (t.isArrayPattern(id) && id.elements.every(t.isIdentifier)),
      "return() must be assigned to an Identifier or an ObjectPattern or ArrayPattern with no RestElement"
    )

    const checkNulls = list =>
      list.reduce(
        (accum, key) =>
          accum ? t.logicalExpression("||", accum, isNull(key)) : isNull(key),
        null
      )

    const condition = t.isIdentifier(id)
      ? isNull(id)
      : t.isObjectPattern(id)
      ? checkNulls(id.properties.map(x => x.value))
      : t.isArrayPattern(id)
      ? checkNulls(id.elements)
      : null

    declaratorNode.init = declaratorNode.init.left
    declaratorPath.parentPath.insertAfter(
      t.ifStatement(condition, t.returnStatement(callPath.node.arguments[0]))
    )
  })
})
