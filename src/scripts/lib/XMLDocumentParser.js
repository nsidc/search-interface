define([], function () {

  var XMLDocumentParser, namespaces = {
    'atom': 'http://www.w3.org/2005/Atom',
    'gco' : 'http://www.isotc211.org/2005/gco',
    'geo' : 'http://a9.com/-/opensearch/extensions/geo/1.0/',
    'georss' : 'http://www.georss.org/georss',
    'gmd' : 'http://www.isotc211.org/2005/gmd',
    'ical' : 'http://www.w3.org/2002/12/cal/ical#',
    'nsidc': 'http://nsidc.org/ns/opensearch/1.1/',
    'os' : 'http://a9.com/-/spec/opensearch/1.1/',
    'dif': 'http://gcmd.gsfc.nasa.gov/Aboutus/xml/dif/',
    'dc' : 'http://purl.org/dc/elements/1.1/'
  };

  XMLDocumentParser = {

    getIEnamespaceString : function (ns) {
      var nsStrings = [];

      _(ns).each(function (url, name) {
        nsStrings.push('xmlns:' + name + '="' + url + '"');
      });

      return nsStrings.join(' ');
    },

    createDocument : function (rootTagName, namespaceUri) {
      var doc, NODE_ELEMENT = 1;
      if (document.implementation && document.implementation.createDocument) {
        return document.implementation.createDocument(namespaceUri, rootTagName, null);
      } else if (typeof ActiveXObject !== 'undefined') {
        doc = this.createMsXmlDocument();
        if (doc) {
          if (rootTagName) {
            doc.appendChild(doc.createNode(NODE_ELEMENT, rootTagName, namespaceUri));
          }
          return doc;
        }
      }
    },

    loadXml : function (xml) {
      if (typeof DOMParser !== 'undefined' && document.implementation.hasFeature('XPath', '3.0')) {
        return new DOMParser().parseFromString(xml, 'text/xml');
      } else if (typeof ActiveXObject !== 'undefined') {
        var doc = this.createMsXmlDocument();
        doc.setProperty('SelectionNamespaces', this.getIEnamespaceString(namespaces));
        doc.loadXML(xml);
        return doc;
      }
    },

    createMsXmlDocument : function () {
      var MAX_XML_SIZE_KB = 2 * 1024, MAX_ELEMENT_DEPTH = 256,
      doc = new ActiveXObject('MSXML2.DOMDocument');
      if (doc) {
        doc.resolveExternals = false;
        doc.validateOnParse = false;

        try {
          doc.setProperty('ProhibitDTD', true);
          doc.setProperty('MaxXMLSize', MAX_XML_SIZE_KB);
          doc.setProperty('MaxElementDepth', MAX_ELEMENT_DEPTH);
        } catch (e) {
          // No-op.
        }
      }
      return doc;
    },


    getFirstNodeValue : function (node) {
      if (node && node.length > 0) {
        if (node[0].childNodes.length > 0) {
          if (node[0].childNodes[0].nodeValue !== undefined) {
            return node[0].childNodes[0].nodeValue;
          }
        }
      }
    },

    getAllNodeValues : function (nodeList) {
      var nodeValues = [];
      _.each(nodeList, function (node) {
        if (node.childNodes.length > 0) {
          nodeValues.push(node.childNodes[0].nodeValue);
        }
      });
      return nodeValues;
    },

    selectNodes : function (node, path) {
      var doc, resolver, nodes, results, count, i;

      if (!node) {
        return [];
      }

      doc = this.getOwnerDocument(node);

      if (typeof node.selectNodes !== 'undefined') {
        if (typeof doc.setProperty !== 'undefined') {
          doc.setProperty('SelectionLanguage', 'XPath');
        }
        return node.selectNodes(path);

      } else if (doc.implementation.hasFeature('XPath', '3.0')) {
        resolver = function (prefix) {
          return namespaces[prefix] || null;
        };
        nodes = doc.evaluate(path, node, resolver,
                                 XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        results = [];
        count = nodes.snapshotLength;
        for (i = 0; i < count; i += 1) {
          results.push(nodes.snapshotItem(i));
        }
        return results;

      } else {
        return [];
      }
    },

    getOwnerDocument : function (node) {
      var DOCUMENT_NODE = 9;

      return (node.nodeType === DOCUMENT_NODE ? node : node.ownerDocument);
    }
  };

  return XMLDocumentParser;
});
