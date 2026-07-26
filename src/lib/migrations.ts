export function splitSqlStatements(source: string) {
  const statements: string[] = [];
  let current = "";
  let singleQuoted = false;
  let doubleQuoted = false;
  let dollarQuoted = false;

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    const next = source[index + 1];

    if (!singleQuoted && !doubleQuoted && character === "$" && next === "$") {
      dollarQuoted = !dollarQuoted;
      current += "$$";
      index += 1;
      continue;
    }
    if (!dollarQuoted && !doubleQuoted && character === "'") {
      if (singleQuoted && next === "'") {
        current += "''";
        index += 1;
        continue;
      }
      singleQuoted = !singleQuoted;
    } else if (!dollarQuoted && !singleQuoted && character === '"') {
      doubleQuoted = !doubleQuoted;
    }

    if (character === ";" && !singleQuoted && !doubleQuoted && !dollarQuoted) {
      if (current.trim()) statements.push(current.trim());
      current = "";
    } else {
      current += character;
    }
  }
  if (current.trim()) statements.push(current.trim());
  return statements;
}
