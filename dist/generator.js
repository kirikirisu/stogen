"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generator = void 0;
const node_fs_1 = __importDefault(require("node:fs"));
const path = __importStar(require("node:path"));
const react_1 = __importDefault(require("react"));
const t = __importStar(require("@babel/types"));
const parser_1 = require("@babel/parser");
const traverse_1 = __importDefault(require("@babel/traverse"));
const react_docgen_typescript_1 = require("react-docgen-typescript");
const lib_1 = require("./lib");
const root = process.cwd();
const generator = (inputPath) => {
    const absolutePath = path.resolve(root, inputPath);
    const storyTemplatePath = path.resolve(__dirname, "../src/story-template.txt");
    try {
        // use docgen to get prop type and set default value
        const doc = (0, react_docgen_typescript_1.parse)(absolutePath, {
            savePropValueAsString: false,
        });
        const allPropDocs = doc[0].props;
        if (Object.keys(allPropDocs).length <= 0)
            throw new Error(`Types not found in specified file.\n Maybe the types are not imported in the following files.\n => ${absolutePath}\n`);
        // use babel tool to get props used in component
        const code = node_fs_1.default.readFileSync(absolutePath, {
            encoding: "utf8",
        });
        const ast = (0, parser_1.parse)(code, {
            sourceType: "module",
            plugins: ["jsx", "typescript"],
        });
        const argList = {};
        (0, traverse_1.default)(ast, {
            VariableDeclaration: {
                enter({ node }) {
                    node.declarations.forEach((decl) => {
                        if (t.isVariableDeclarator(decl)) {
                            let componentName;
                            if (t.isIdentifier(decl.id) &&
                                (0, lib_1.isInitialsUpperCase)(decl.id.name)) {
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
                                                        argValue = react_1.default.createElement("div", null, "node");
                                                    }
                                                    else {
                                                        const propDoc = allPropDocs[argKey];
                                                        argValue = propDoc.defaultValue
                                                            ? propDoc.defaultValue.value
                                                            : (0, lib_1.fallbackValue)(propDoc.type.name);
                                                    }
                                                    argList[componentName] = Object.assign(Object.assign({}, argList[componentName]), { [argKey]: argValue });
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
            throw new Error("Component definition was not found in the specified file.");
        const storyTemplate = node_fs_1.default.readFileSync(storyTemplatePath, {
            encoding: "utf8",
        });
        argListKeys.forEach((key) => {
            const story = storyTemplate
                .replace(/slot-1/g, key)
                // valueがundefinedのやつは消される
                .replace(/slot-2/g, JSON.stringify(argList[key], null, 4));
            const writingStoryPath = absolutePath.split("/").slice(0, -1).join("/") + `/${key}.stories.tsx`;
            node_fs_1.default.writeFileSync(writingStoryPath, story);
        });
    }
    catch (e) {
        console.log(e);
    }
};
exports.generator = generator;
