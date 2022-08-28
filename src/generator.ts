import fs from "node:fs";
import * as path from "node:path";
import React from "react";
import * as t from "@babel/types";
import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import { parse as docgenParser } from "react-docgen-typescript";
import { fallbackValue, isInitialsUpperCase } from "./lib";

const root = process.cwd();
const absolutePath = path.resolve(root, `src/components/InputText/index.tsx`);
const storyTemplatePath = path.resolve(root, "src/story-template.txt");

export const generator = (inputPath: string) => {
  console.log(inputPath);
  try {
    // use docgen to get prop type and set default value
    const doc = docgenParser(absolutePath, {
      savePropValueAsString: false,
    });

    const allPropDocs = doc[0].props;
    if (Object.keys(allPropDocs).length <= 0)
      throw new Error(
        `Types not found in specified file.\n Maybe the types are not imported in the following files.\n => ${absolutePath}\n`
      );

    // use babel tool to get props used in component
    const code = fs.readFileSync(absolutePath, {
      encoding: "utf8",
    });

    const ast = parse(code, {
      sourceType: "module",
      plugins: ["jsx", "typescript"],
    });

    const argList: any = {};
    traverse(ast, {
      VariableDeclaration: {
        enter({ node }) {
          node.declarations.forEach((decl) => {
            if (t.isVariableDeclarator(decl)) {
              let componentName: any;
              if (
                t.isIdentifier(decl.id) &&
                isInitialsUpperCase(decl.id.name)
              ) {
                componentName = decl.id.name;
                argList[componentName] = [];
              }

              if (t.isArrowFunctionExpression(decl.init)) {
                decl.init.params.forEach((param) => {
                  if (t.isObjectPattern(param)) {
                    param.properties.forEach((prop) => {
                      if (t.isObjectProperty(prop)) {
                        if (t.isIdentifier(prop.key)) {
                          const argKey = prop.key.name;
                          let argValue;

                          if (argKey === "children") {
                            // argValue = "<div>chirdren</div>".replace('/"/g', "");
                            argValue = React.createElement("div", null, "node");
                          } else {
                            const propDoc = allPropDocs[argKey];

                            argValue = propDoc.defaultValue
                              ? propDoc.defaultValue.value
                              : fallbackValue(propDoc.type.name);
                          }

                          argList[componentName] = {
                            ...argList[componentName],
                            ...{ [argKey]: argValue },
                          };
                        }
                      }
                    });
                  }
                });
              }
            }
          });
        },
      },
    });

    const argListKeys = Object.keys(argList);
    if (argListKeys.length <= 0)
      throw new Error(
        "Component definition was not found in the specified file."
      );

    const storyTemplate = fs.readFileSync(storyTemplatePath, {
      encoding: "utf8",
    });

    argListKeys.forEach((key) => {
      const story = storyTemplate
        .replace(/slot-1/g, key)
        // valueがundefinedのやつは消される
        .replace(/slot-2/g, JSON.stringify(argList[key], null, 4));

      const writingStoryPath = path.resolve(
        root,
        `src/components/${key}.stories.tsx`
      );

      fs.writeFileSync(writingStoryPath, story);
    });
  } catch (e) {
    console.log(e);
  }
};
