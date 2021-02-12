/* jshint esversion: 6 */

import $ from 'jquery';
import JSONResults from './JSONResults';
import * as UtilityFunctions from './utility_functions';

class NsidcOpenSearchResponse {
    getBoundingBoxFrom(xml) {
        var bboxes, boxObj, boxArr;

        bboxes = $(xml).filterNode('georss:box'); //$(xml).find('georss\\:box, box');
        boxArr = [];

        _.each(bboxes, function (box) {
            var coords = $(box).text().split(' ');
            boxObj = {
                north: coords[2],
                east: coords[3],
                south: coords[0],
                west: coords[1]
            };

            boxArr.push(boxObj);
        });

        return boxArr;
    }

    getDateRangeFrom(xml) {
        var dates, rangeObj, rangeArr, dateRegex = new RegExp('(.*)\/(.*)');

        dates = $(xml).filterNode('dc:date');
        rangeArr = [];

        _.each(dates, function (date) {
            var dateParts = $(date).text().match(dateRegex);
            rangeObj = {
                startDate: dateParts[1],
                endDate: dateParts[2]
            };

            rangeArr.push(rangeObj);

        });

        return rangeArr;
    }

    getDataUrlsFrom(xml) {
        var links, linkArr = [];
        links = $(xml).find('link[rel=download-data]');

        _.each(links, function (link) {
            var linkObj = this.getLinkObj(link);
            linkArr.push(linkObj);
        });

        return linkArr;
    }

    getLinkObj(linkXml) {
        var linkObj, link = $(linkXml);

        if(link.length > 0) {
            linkObj = {
                title: link.attr('title'),
                href: link.attr('href'),
                description: link.attr('nsidc:description')
            };
        }
        return linkObj;
    }

    getSortedArray(xml, selector) {
        var arr = UtilityFunctions.getArrayFromjQueryArrayTextContents($(xml).filterNode(selector));
        if(arr !== undefined) {
            arr = arr.sort();
        }
        return _.uniq(arr);
    }

    processOsEntries(entryXml) {
        var results = [];

        entryXml.find('entry').each(function () {
            var entryObj, entry = $(this);

            entryObj = {
                title: entry.filterNode('title').text(),
                authoritativeId: entry.filterNode('nsidc:authoritativeId').text(),
                dataUrl: entry.find('link[rel=enclosure]').attr('href'),
                catalogUrl: entry.find('link[rel=describedBy]').attr('href'),
                boundingBoxes: this.getBoundingBoxFrom(this),
                dateRanges: this.getDateRangeFrom(this),
                updated: entry.find('updated').text(),
                summary: UtilityFunctions.removeWhitespace(UtilityFunctions.removeTags(entry.filterNode('summary').text())),
                author: UtilityFunctions.getArrayFromjQueryArrayTextContents(entry.filterNode('author')),
                parameters: this.getSortedArray(this, 'dif:Detailed_Variable'),
                keywords: this.getSortedArray(this, 'dif:Keyword'),
                dataFormats: this.getSortedArray(this, 'dif:Distribution'),
                dataUrls: this.getDataUrlsFrom(this),
                orderDataUrl: this.getLinkObj(entry.find('link[rel=order-data]')),
                externalDataUrl: this.getLinkObj(entry.find('link[rel=external-data]')),
                supportingPrograms: this.getSortedArray(this, 'nsidc:supportingProgram'),
                dataCenterNames: this.getSortedArray(this, 'nsidc:dataCenter')
            };
            results.push(entryObj);
        });

        return results;
    }

    fromXml(xml, osParameters) {
        let entryXml = $($.parseXML(xml)),
            jsonOptions = {
                results: this.processOsEntries(entryXml),
                totalCount: parseInt(entryXml.filterNode('os:totalResults').text(), 10),
                currentIndex: parseInt(entryXml.filterNode('os:startIndex').text(), 10),
                itemsPerPage: parseInt(entryXml.filterNode('os:itemsPerPage').text(), 10),
                keyword: osParameters.osSearchTerms,
                authorTerms: osParameters.osAuthor,
                parameterTerms: osParameters.osParameter,
                sensorTerms: osParameters.osSensor,
                titleTerms: osParameters.osTitle,
                startDate: osParameters.osDtStart,
                endDate: osParameters.osDtEnd,
                sortKeys: osParameters.osSortKeys,
                geoBoundingBox: osParameters.geoBoundingBox,
                facetFilters: osParameters.osFacetFilters
            };

        return new JSONResults(jsonOptions);
    }
}

export default NsidcOpenSearchResponse;
