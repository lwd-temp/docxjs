import { Length, LengthUsage, LengthUsageType, convertLength, convertPercentage, convertBoolean  } from "../document/common";

export function parseXmlString(xmlString: string, trimXmlDeclaration: boolean = false): Document {
    if (trimXmlDeclaration)
        xmlString = xmlString.replace(/<[?].*[?]>/, "");
    
    const result = new DOMParser().parseFromString(xmlString, "application/xml");  
    const errorText = hasXmlParserError(result);

    if (errorText)
        throw new Error(errorText);

    return result;
}

function hasXmlParserError(doc: Document) {
    return doc.getElementsByTagName("parsererror")[0]?.textContent;
}

export function serializeXmlString(elem: Node): string {
    return new XMLSerializer().serializeToString(elem);
}

export function elements(elem: Element, localName: string = null): Element[] {
    const result = [];

    for (let i = 0, l = elem.childNodes.length; i < l; i++) {
        let c = elem.childNodes.item(i);

        if (c.nodeType == Node.ELEMENT_NODE && (localName == null || (c as Element).localName == localName))
            result.push(c);
    }

    return result;
}

export function attr(elem: Element, localName: string): string {
    for (let i = 0, l = elem.attributes.length; i < l; i++) {
        let a = elem.attributes.item(i);

        if (a.localName == localName)
            return a.value;
    }

    return null;
}

export class XmlParser {
    elements = elements;

    element(elem: Element, localName: string): Element {
        for (let i = 0, l = elem.childNodes.length; i < l; i++) {
            let c = elem.childNodes.item(i);

            if (c.nodeType == 1 && (c as Element).localName == localName)
                return c as Element;
        }

        return null;
    }
    
    elementAttr(elem: Element, localName: string, attrLocalName: string): string {
        var el = this.element(elem, localName);
        return el ? this.attr(el, attrLocalName) : undefined;
    }

    attr = attr;

    intAttr(node: Element, attrName: string, defaultValue: number = null): number {
        var val = this.attr(node, attrName);
        return val ? parseInt(val) : defaultValue;
    }

    floatAttr(node: Element, attrName: string, defaultValue: number = null): number {
        var val = this.attr(node, attrName);
        return val ? parseFloat(val) : defaultValue;
    }

    boolAttr(node: Element, attrName: string, defaultValue: boolean = null) {
        return convertBoolean(this.attr(node, attrName), defaultValue);
    }

    percentageAttr(node: Element, attrName: string): number {
        return convertPercentage(this.attr(node, attrName));
    }

    lengthAttr(node: Element, attrName: string, usage: LengthUsageType = LengthUsage.Dxa): Length {
        return convertLength(this.attr(node, attrName), usage);
    }
}

const globalXmlParser = new XmlParser();

export default globalXmlParser;