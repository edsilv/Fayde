module Fayde.Markup {
    export class FrameworkTemplate extends XamlObject {
        private $$markup: nullstone.markup.Markup<any>;

        GetVisualTree (bindingSource: DependencyObject): UIElement {
            var uie = LoadImpl<UIElement>(bindingSource, this.$$markup, bindingSource);
            if (!(uie instanceof UIElement))
                throw new XamlParseException("Template root visual is not a UIElement.");
            return uie;
        }
    }

    function setTemplateRoot (ft: FrameworkTemplate, root: any) {
        if (root instanceof Element)
            (<any>ft).$$markup = CreateXaml(root);
    }

    export function Load<T extends XamlObject>(initiator: DependencyObject, xm: nullstone.markup.Markup<any>): T {
        return LoadImpl<T>(initiator, xm);
    }

    function LoadImpl<T>(initiator: DependencyObject, xm: nullstone.markup.Markup<any>, bindingSource?: DependencyObject): T {
        var namescope = new NameScope(true);

        var oresolve: nullstone.IOutType = {
            isPrimitive: false,
            type: undefined
        };

        //TODO: Implement
        var cur: any;
        var xo: XamlObject;

        var parser = xm.createParser()
            .setNamespaces(Fayde.XMLNS, Fayde.XMLNSX)
            .on({
                resolveType: (uri, name) => {
                    TypeManager.resolveType(uri, name, oresolve);
                    return oresolve;
                },
                resolveObject: (type) => {
                    var obj = new (type)();
                    if (obj instanceof FrameworkTemplate)
                        parser.skipNextElement();
                    return obj;
                },
                resolvePrimitive: (type, text) => {
                    //TODO: Finish
                    return new (type)(text);
                },
                elementSkip: (root: any, obj: any) => {
                    if (obj instanceof FrameworkTemplate)
                        setTemplateRoot(<FrameworkTemplate>obj, root);
                },
                object: (obj) => {
                    cur = obj;
                    if (cur instanceof XamlObject) {
                        xo = <XamlObject>cur;
                        xo.XamlNode.DocNameScope = namescope;
                    }
                },
                objectEnd: (obj, prev) => {
                    cur = prev;
                    if (cur instanceof XamlObject)
                        xo = <XamlObject>cur;
                },
                contentObject: (obj) => {
                    cur = obj;
                    if (cur instanceof XamlObject) {
                        xo = <XamlObject>cur;
                        xo.XamlNode.DocNameScope = namescope;
                        xo.TemplateOwner = bindingSource;
                    }
                },
                contentText: (text) => {
                },
                name: (name) => {
                    if (xo) {
                        namescope.RegisterName(name, xo.XamlNode);
                        xo.XamlNode.Name = name;
                    }
                },
                key: (key) => {
                },
                propertyStart: (ownerType, propName) => {
                },
                propertyEnd: (ownerType, propName) => {
                },
                resourcesStart: (owner) => {
                },
                resourcesEnd: (owner) => {
                },
                error: (err) => false,
                end: () => {
                }
            });
        parser.parse(xm.root);
        //TODO: Return result
        return null;
    }
}