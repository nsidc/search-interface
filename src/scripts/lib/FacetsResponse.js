define(['lib/JSONFacets'], function (JSONFacets) {

  function parseFacets(entryXml, nameMap) {
    var facets = [];

    entryXml.filterNode('nsidc:facet').each(function () {
      var entry = $(this);

      facets.push({
        id: entry.attr('name'),
        name: getName(fetchXmlName(entry), nameMap),
        values: getValues(entry)
      });
    });

    return facets;
  }

  function formatName(name) {
    var parsedName = [],
      nameArr = name.replace('facet_', '').split('_');

    _.each(nameArr, function (entry) {
      parsedName.push(entry[0].toUpperCase() + entry.slice(1));
    });

    return parsedName.join(' ');
  }

  function getName(name, nameMap) {
    if (nameMap && _.has(nameMap, name)) {
      return nameMap[name];
    } else {
      return formatName(name);
    }
  }

  //Create a HTML 4 compliant id that works in JQuery:
  //HTML 4: ID and NAME tokens must begin with a letter ([A-Za-z]) and may be followed by any number
  // of letters, digits ([0-9]), hyphens ('-'), underscores ('_'), colons (':'), and periods ('.').
  //JQuery has problems with : and . so remove those as well
  function generateId(name) {
    return name.replace(/ /g, '_').replace(/\|/g, '--')
      .replace(/</g, 'lt').replace(/>/g, 'gt').replace(/\+/g, 'plus').replace(/[^a-zA-Z0-9_-]/g, '')
      .replace(/^([^a-zA-Z])/g, 'a$1');
  }

  function getValueNames(el) {
    var fullName = el.attr('name'),
        id = generateId(fullName),
        names = fullName.split(/\s*\|\s*/),
        longName = names[0].trim().length > 0 ? names[0] : names[1],
        shortName = names[1] ? names[1] : names[0];

    return {
      id: id,
      fullName: fullName,
      longName: longName,
      shortName: shortName
    };
  }

  function getValues(facetNode) {
    var values = [];

    facetNode.filterNode('nsidc:facet_value').each(function () {
      values.push(_.extend(getValueNames($(this)), {
        count: $(this).attr('hits')
      }));
    });

    return values;
  }

  function fetchXmlName(facetNode) {
    return facetNode.attr('name');
  }

  var FacetsResponse = function (config) {
    this.nameMap = config.nameMap;

    this.fromXml = function (xml, osParameters) {
      var entryXml = $($.parseXML(xml)), jsonOptions;

      jsonOptions = {
        facets: parseFacets(entryXml, this.nameMap),
        keyword: osParameters.osSearchTerms,
        startDate: osParameters.osDtStart,
        endDate: osParameters.osDtEnd,
        geoBoundingBox: osParameters.geoBoundingBox
      };

      return new JSONFacets(jsonOptions);
    };
  };

  return FacetsResponse;
});
