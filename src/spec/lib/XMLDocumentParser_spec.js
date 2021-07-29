import XMLDocumentParser from '../../lib/XMLDocumentParser';

describe('XMLDocumentParser', function () {
  it('uses the current JS runtime to create an XML document', function () {
    var rootTagName = 'foo', namespaceUri = null,
    doc = XMLDocumentParser.createDocument(rootTagName, namespaceUri);

    expect(doc.getElementsByTagName('foo').length).toBe(1);
  });

  it('selects multiple nodes using an XPath expression and a root node', function () {
    var xml = '<feed xmlns="http://www.w3.org/2005/Atom"><entry>a</entry><entry>b</entry></feed>',
    node, xpath = '//atom:entry';

    node = XMLDocumentParser.loadXml(xml).firstChild;
    expect(XMLDocumentParser.selectNodes(node, xpath).length).toBe(2);
  });

  describe('XML namespaces', function () {
    it('gets a string containing the namespaces formatted for IE', function () {
      var namespaces = {
        'namespace': 'url',
        'nsidc': 'http://nsidc.org/ns/opensearch/1.1/',
        'os' : 'http://a9.com/-/spec/opensearch/1.1/'
      };

      expect(XMLDocumentParser.getIEnamespaceString(namespaces)).toBe(
        'xmlns:namespace="url" ' +
        'xmlns:nsidc="http://nsidc.org/ns/opensearch/1.1/" ' +
        'xmlns:os="http://a9.com/-/spec/opensearch/1.1/"');
    });
  });
});
