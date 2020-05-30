import {
  DNodeRawProps,
  IDNode,
  IDNodeOpts,
  IDNodeType,
  INote,
  INoteOpts
} from "./types";

// import { IconType } from "antd/lib/notification";
import _ from "lodash";

// export interface DataNode {
//   checkable?: boolean;
//   children?: DataNode[];
//   disabled?: boolean;
//   disableCheckbox?: boolean;
//   icon?: IconType;
//   isLeaf?: boolean;
//   key: string | number;
//   title?: React.ReactNode;
//   selectable?: boolean;
//   switcherIcon?: IconType;
//   /** Set style of TreeNode. This is not recommend if you don't have any force requirement */
//   className?: string;
//   style?: React.CSSProperties;
// }

// @ts-ignore
interface YAMLEntryOpts {
  id: string;
}

export abstract class DNode implements IDNode {
  public id: string;
  public title: string;
  public desc: string;
  public type: IDNodeType;
  public updated: string;
  public created: string;
  public parent: IDNode | null;
  public children: IDNode[];
  public body: string;
  public parentId: string | null;
  public childrenIds: string[];

  constructor(opts: IDNodeOpts) {
    const {
      id,
      title,
      desc,
      type,
      updated,
      created,
      parent,
      children,
      body,
      parentId,
      childrenIds
    } = _.defaults(opts, {
      updated: "TODO",
      created: "TODO",
      id: "TODO",
      desc: "",
      schemaId: -1,
      children: [],
      childrenIds: [],
      parentId: null,
      parent: null,
      body: ""
    });
    this.id = id;
    this.title = title;
    this.desc = desc;
    this.type = type;
    this.updated = updated;
    this.created = created;
    this.parent = parent;
    this.children = children;
    this.body = body;
    this.parentId = parentId;
    this.childrenIds = childrenIds;
  }

  get path(): string {
    if (this.parent && this.parent.title !== "root") {
      return [this.parent.path, this.title].join(".");
    } else {
      return this.title;
    }
  }

  get url(): string {
    return `/doc/${this.id}`;
  }

  addChild(node: IDNode) {
    this.children.push(node);
    node.parent = this;
  }

  renderBody(): string {
    return this.body || "Empty Document";
  }

  toDocument() {
    return {
      document: {
        nodes: [
          {
            object: "block",
            type: "paragraph",
            nodes: [
              {
                object: "text",
                text: this.renderBody()
              }
            ]
          }
        ]
      }
    };
  }

  toRawProps(): DNodeRawProps {
    const props = _.pick(this, [
      "id",
      "title",
      "desc",
      "type",
      "updated",
      "created",
      "body",
      "parentId",
      "childrenIds"
    ]);
    return props;
  }
}

export class Note extends DNode implements INote {
  public schemaId: string;

  constructor(props: INoteOpts) {
    super({ ...props, parent: null, children: [] });
    this.schemaId = props.schemaId || "-1";
  }
}

// === Old
// export class SchemaStubWrapper {
//   static fromSchemaNode(node: SchemaNode): SchemaNodeStub {
//     return _.omit(node, "children", "parent");
//   }

//   static fromSchemaYAMLEntry(
//     entry: SchemaYAMLEntryRaw,
//     opts: YAMLEntryOpts
//   ): SchemaNodeStub {
//     const { id } = opts;
//     const schemaDataKeysDefaults: {
//       [key in SchemaDataKey]: any;
//     } = {
//       aliases: [],
//       kind: undefined,
//       choices: [],
//       title: id,
//       desc: "",
//       type: "schema",
//     };
//     //const title = entry.title ? entry.title : entry.id;

//     const data = _.defaults(
//       {},
//       _.omit(entry, "children"),
//       schemaDataKeysDefaults
//     );
//     const schemaNode = { data, id };
//     return schemaNode;
//   }
// }

// export class SchemaNodeWrapper {
//   static fromSchemaYAMLEntry(
//     entry: SchemaYAMLEntryRaw,
//     opts: YAMLEntryOpts
//   ): SchemaNode {
//     entry = _.defaults(entry, { children: [] });
//     const schemaStub = SchemaStubWrapper.fromSchemaYAMLEntry(entry, opts);
//     const parent = null;
//     const children = _.map(entry.children, (entry, id: string) => {
//       return SchemaStubWrapper.fromSchemaYAMLEntry(entry, { id });
//     });
//     const schemaNode = { ...schemaStub, parent, children };
//     return schemaNode;
//   }

//   // static deserialize(yamlString: string): SchemaTree {
//   //   const schema: SchemaYAML = YAML.parse(yamlString);
//   //   const tree = SchemaTree.fromSchemaYAML(schema);
//   //   return tree;
//   // }
// }

// export class NodeWrapper {
//   public node: DNode;
//   constructor(node: DNode) {
//     this.node = node;
//   }

//   static renderBody(node: DNode) {
//     return node.body || "";
//   }
// }

// export class SchemaTree {
//   public name: string;
//   public root: SchemaNode;
//   public nodes: SchemaNodeDict;

//   constructor(name: string, root: SchemaNode, nodes?: SchemaNodeDict) {
//     this.name = name;
//     this.root = root;
//     this.nodes = _.cloneDeep(nodes) || {};
//     this.addChild(root, null);
//   }

//   /**
//    * Add a subtree and merge all nodes
//    * @param tree
//    * @param parent
//    */
//   addSubTree(tree: SchemaTree, id: string) {
//     const parent = this.nodes[id];
//     this.addChild(tree.root, parent);
//     this.nodes = _.merge(this.nodes, tree.nodes);
//   }

//   addChild(child: SchemaNode, parent: SchemaNode | null) {
//     const childStub = SchemaStubWrapper.fromSchemaNode(child);
//     if (parent) {
//       const parentNode = this.nodes[parent.id];
//       if (_.isUndefined(parentNode)) {
//         throw `no parent with ${parent.id} found`;
//       }
//       parentNode.children.push(childStub);
//     }
//     this.nodes[child.id] = child;
//   }

//   static fromSchemaYAML(yamlString: string): SchemaTree {
//     const schemaYAML: SchemaYAMLRaw = YAML.parse(yamlString);
//     const { name, schema } = schemaYAML;

//     const root = SchemaNodeWrapper.fromSchemaYAMLEntry(schema.root, {
//       id: name,
//     });
//     const tree = new SchemaTree(name, root);

//     const unvisited: SchemaNode[] = [root];
//     while (!_.isEmpty(unvisited)) {
//       const parent: SchemaNode = unvisited.pop() as SchemaNode;
//       _.map(parent.children, ({ id: childId }: SchemaNodeStub) => {
//         // @ts-ignore
//         const entry: SchemaYAMLEntryRaw = schema[childId];

//         const childNode = SchemaNodeWrapper.fromSchemaYAMLEntry(entry, {
//           id: childId,
//         });
//         // NOTE: parent relationships already defined in yaml
//         tree.addChild(childNode, null);
//         unvisited.push(childNode);
//       });
//     }
//     return tree;
//   }

//   toAntDTree() {
//     const schemaNode2AntDNode = (
//       node: SchemaNode,
//       nodeDict: SchemaNodeDict
//     ): DataNode => {
//       const { title } = node.data;
//       const { id } = node;
//       return {
//         title,
//         key: id,
//         children: _.map(node.children, (ch) =>
//           schemaNode2AntDNode(nodeDict[ch.id], nodeDict)
//         ),
//       };
//     };
//     const out = schemaNode2AntDNode(this.root, this.nodes);
//     // replace `root` with name of schema
//     out.title = this.name;
//     return out;
//   }

//   toD3Tree() {
//     const schemaNode2D3Node = (
//       node: SchemaNode,
//       nodeDict: SchemaNodeDict
//     ): ReactD3TreeItemV2<any> => {
//       const { title } = node.data;
//       const { id } = node;
//       return {
//         name: title,
//         id,
//         attributes: {},
//         children: _.map(node.children, (ch) =>
//           schemaNode2D3Node(nodeDict[ch.id], nodeDict)
//         ),
//       };
//     };
//     const out = schemaNode2D3Node(this.root, this.nodes);
//     // replace `root` with name of schema
//     out.name = this.name;
//     return out;
//   }
// }