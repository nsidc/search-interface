/* jshint esversion: 6 */

import _ from 'underscore';
import JSONFacets from './JSONFacets';

class FacetsResponse {
    //define(['lib/JSONFacets'], function (JSONFacets) {
    constructor(config) {
        this.nameMap = config.nameMap;
    }

    parseFacets(entryXml, nameMap) {
        let facets = [];

        entryXml.filterNode('nsidc:facet').each(function () {
            var entry = $(this);

            facets.push({
                id: entry.attr('name'),
                name: this.getName(this.fetchXmlName(entry), nameMap),
                values: this.getValues(entry)
            });
        });

        return facets;
    }

    formatName(name) {
        let parsedName = [],
            nameArr = name.replace('facet_', '').split('_');

        _.each(nameArr, function (entry) {
            parsedName.push(entry[0].toUpperCase() + entry.slice(1));
        });

        return parsedName.join(' ');
    }

    getName(name, nameMap) {
        if(nameMap && _.has(nameMap, name)) {
            return nameMap[name];
        }
        else {
            return this.formatName(name);
        }
    }

    //Create a HTML 4 compliant id that works in JQuery:
    //HTML 4: ID and NAME tokens must begin with a letter ([A-Za-z]) and may be followed by any number
    // of letters, digits ([0-9]), hyphens ('-'), underscores ('_'), colons (':'), and periods ('.').
    //JQuery has problems with : and . so remove those as well
    generateId(name) {
        return name.replace(/ /g, '_').replace(/\|/g, '--')
        .replace(/</g, 'lt').replace(/>/g, 'gt').replace(/\+/g, 'plus').replace(/[^a-zA-Z0-9_-]/g, '')
        .replace(/^([^a-zA-Z])/g, 'a$1');
    }

    getValueNames(el) {
        let fullName = el.attr('name'),
            id = this.generateId(fullName),
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

    getValues(facetNode) {
        let values = [];

        facetNode.filterNode('nsidc:facet_value').each(function () {
            values.push(_.extend(this.getValueNames($(this)), {
                count: $(this).attr('hits')
            }));
        });

        return values;
    }

    fetchXmlName(facetNode) {
        return facetNode.attr('name');
    }

    fromXml(xml, osParameters) {
        let entryXml = $($.parseXML(xml)), jsonOptions;

        jsonOptions = {
            facets: this.parseFacets(entryXml, this.nameMap),
            keyword: osParameters.osSearchTerms,
            startDate: osParameters.osDtStart,
            endDate: osParameters.osDtEnd,
            geoBoundingBox: osParameters.geoBoundingBox
        };

        return new JSONFacets(jsonOptions);
    }
}

export default FacetsResponse;
