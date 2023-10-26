// import GetDataButtonView from '../../views/result_item/GetDataButtonView';

describe.skip('Get Data button View', function () {

    describe('rendering', function () {

        it('doesn\'t have a link if there\'s no URL in the model', function () {
            var modelWithNoUrl = new Backbone.Model(),
                el = document.createElement('div'),
                getDataButtonView = new GetDataButtonView({el: el, model: modelWithNoUrl});

            getDataButtonView.render();

            expect($(el).find('a').length).toEqual(0);
        });

        it('uses a single dataUrl to generate a button drop-down', function () {
            var modelWithUrl = new Backbone.Model({dataUrls: [{href: 'http://some_url', title: 'ftp'}]}),
                el = document.createElement('div'),
                getDataButtonView = new GetDataButtonView({el: el, model: modelWithUrl});

            getDataButtonView.render();

            expect($(el).find('button').text()).toContain('Get Data');
            expect($(el).find('div.dropdown-menu').length).toEqual(1);
            expect($(el).find('tr.getdata-value').attr('get-data-link')).toContain('http://some_url');
            expect($(el).find('td.getdata-title').text()).toBe('ftp');
        });

        it('uses multiple dataUrls to generate a button drop-down', function () {
            var titles, links, modelWithUrl = new Backbone.Model({
                    dataUrls: [{href: 'http://some_url', title: 'ftp'}, {href: 'http://url_two', title: 'polaris'}]
                }),
                el = document.createElement('div'),
                getDataButtonView = new GetDataButtonView({el: el, model: modelWithUrl});

            getDataButtonView.render();

            expect($(el).find('button').text()).toContain('Get Data');
            expect($(el).find('div.dropdown-menu').length).toEqual(1);
            links = $(el).find('tr.getdata-value');
            titles = $(el).find('td.getdata-title');
            expect(links.length).toEqual(2);
            expect(titles.length).toEqual(2);
            expect($(links[0]).attr('get-data-link')).toContain('http://some_url');
            expect($(titles[0]).text()).toBe('ftp');
            expect($(links[1]).attr('get-data-link')).toContain('http://url_two');
            expect($(titles[1]).text()).toBe('polaris');
        });

        it('renders hidden description information', function () {
            var desc_tags, modelWithUrl = new Backbone.Model({
                    dataUrls: [{href: 'http://some_url', title: 'ftp', description: 'download via FTP'},
                        {href: 'http://url_two', title: 'polaris', description: 'Use Polaris to subset, reproject and reformat'}]
                }),
                el = document.createElement('div'),
                getDataButtonView = new GetDataButtonView({el: el, model: modelWithUrl});

            getDataButtonView.render();

            desc_tags = $(el).find('.getdata-description');
            expect(desc_tags.length).toEqual(2);
            expect(desc_tags[0]).toHaveClass('hidden');
        });

        it('When there are multiple data links the button label is Get Data', function () {
            var modelWithUrl = new Backbone.Model({
                    dataUrls: [{href: 'http://some_url', title: 'ftp'}, {href: 'http://url_two', title: 'polaris'}]
                }),
                el = document.createElement('div'),
                getDataButtonView = new GetDataButtonView({el: el, model: modelWithUrl});

            getDataButtonView.render();

            expect($(el).find('button').text()).toContain('Get Data');
        });

        it('uses a single order data link to render a Get Data button', function () {
            var modelWithUrl = new Backbone.Model({orderDataUrl: [{href: 'http://some_url', title: 'order'}]}),
                el = document.createElement('div'),
                getDataButtonView = new GetDataButtonView({el: el, model: modelWithUrl});

            getDataButtonView.render();

            expect($(el).find('button').text()).toContain('Get Data');
            expect($(el).find('div.dropdown-menu').length).toEqual(1);
            expect($(el).find('tr.getdata-value').attr('get-data-link')).toContain('http://some_url');
        });

        it('lists data and not order links in drop down with get data title', function () {
            var modelWithUrl = new Backbone.Model({
                    orderDataUrl: {href: 'http://order_url', title: 'order'},
                    dataUrls: [{href: 'http://some_url', title: 'ftp'}, {href: 'http://url_two', title: 'polaris'}]
                }),
                el = document.createElement('div'),
                getDataButtonView = new GetDataButtonView({el: el, model: modelWithUrl}),
                links;

            getDataButtonView.render();

            expect($(el).find('button').text()).toContain('Get Data');
            expect($(el).find('td.getdata-title').length).toEqual(2);
            links = $(el).find('tr.getdata-value');
            expect($(links[0]).attr('get-data-link')).toContain('http://some_url');
            expect($(links[1]).attr('get-data-link')).toContain('http://url_two');
        });
    });

    describe('actions', function () {
        var getDataButtonView, event, el;

        beforeEach(function () {
            var modelWithUrl = new Backbone.Model({
                dataUrls: [{href: 'http://some_url', title: 'ftp'},
                    {href: 'http://url_two', title: 'polaris'}]
            });

            el = document.createElement('div');
            getDataButtonView = new GetDataButtonView({el: el, model: modelWithUrl}).render();
            event = sinon.stub();
            event.stopImmediatePropagation = sinon.stub();
            event.currentTarget = $(el).find('.getdata-toggle');
        });

        it('Shows the link description information when the open arrow is clicked', function () {
            var desc_tags;

            getDataButtonView.toggle(event);
            desc_tags = $(el).find('.getdata-description');
            expect(desc_tags.length).toEqual(2);
            expect(desc_tags[0]).not.toHaveClass('hidden');
        });

        it('Hides the link description information when the close arrow is clicked', function () {
            var desc_tags;

            getDataButtonView.toggle(event);
            getDataButtonView.toggle(event);
            desc_tags = $(el).find('.getdata-description');
            expect(desc_tags.length).toEqual(2);
            expect(desc_tags[0]).toHaveClass('hidden');
        });
    });
});
