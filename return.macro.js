const { createMacro } = require("babel-plugin-macros")

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

module.exports = createMacro(({ references, babel }) => {
  const { types: t } = babel

  const isNull = key => t.binaryExpression("==", key, t.nullLiteral())

  references.default.forEach(referencePath => {
    const callPath = referencePath.parentPath

    assert(t.isCallExpression(callPath.node), "return() must be called as a function.")

    const nullishPath = callPath.parentPath
    assert(
      t.isLogicalExpression(nullishPath.node, { operator: "??" }),
      "return() must be assigned to a LogicalExpression using ??, got " +
        nullishPath.node.type
    )

    const declPath = nullishPath.parentPath
    const declNode = declPath.node
    assert(
      t.isVariableDeclarator(declNode) ||
        (t.isAssignmentExpression(declNode) && t.isIdentifier(declNode.left)),
      "return() must be assigned to a VariableDeclarator or AssignmentExpression, got " +
        declNode.type
    )

    const id = t.isVariableDeclarator(declNode) ? declNode.id : declNode.left

    assert(
      t.isIdentifier(id) ||
        (t.isObjectPattern(id) && id.properties.every(t.isObjectProperty)) ||
        (t.isArrayPattern(id) && id.elements.every(t.isIdentifier)),
      "return() must be assigned to an Identifier or an ObjectPattern or ArrayPattern with no RestElement, got " +
        id.type
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

    if (t.isVariableDeclarator(declNode)) {
      declNode.init = declNode.init.left
    } else if (t.isAssignmentExpression(declNode)) {
      declNode.right = declNode.right.left
    }
    declPath.parentPath.insertAfter(
      t.ifStatement(condition, t.returnStatement(callPath.node.arguments[0]))
    )
  })
})
