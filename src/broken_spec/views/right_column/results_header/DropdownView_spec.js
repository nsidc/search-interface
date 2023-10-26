// import DropdownView from '../../../views/right_column/results_header/DropdownView';
// import Mediator from '../../../lib/Mediator';

// var createFakeModel = function () {
//     return sinon.createStubInstance(Backbone.Model);
// };

describe.skip('Dropdown View', function () {
    var mediator,
        options,
        view;

    beforeEach(function () {
        var searchParamsModel;

        mediator = sinon.stub(new Mediator());

        var SearchParamsModel = sinon.stub().returns(createFakeModel());

        searchParamsModel = new SearchParamsModel();

        view = new DropdownView({ model: searchParamsModel });

        view.setMediator(mediator);

        // the following properties are normally defined by subclasses of
        // DropdownView
        view.getButtonId = function () {
            return 'testID';
        };
        view.getSelectedOption = function () {
            return 'display value1';
        };
        view.dropdownOptions = {
            'os1': 'display value1',
            'os2': 'display value2'
        };
        view.updateParamsModel = sinon.stub();

        view.render();
        options = view.$el.find('ul.dropdown-menu a');
    });

    describe('rendering', function () {
        var dropdownOptionsLength;

        beforeEach(function () {
            dropdownOptionsLength = Object.keys(view.dropdownOptions).length;
        });

        it('renders the selected option in the button\'s text', function () {
            expect(view.$el.find('button').text()).toContain('display value1');
        });

        it('assigns the button ID', function () {
            expect(view.$el.find('button').attr('id')).toBe('testID');
        });

        it('renders a divider between each option in the list', function () {
            expect(view.$el.find('li.divider').length).toBe(dropdownOptionsLength - 1);
        });

        it('renders each of the dropdown options in a list', function () {
            expect(view.$el.find('li.dropdown-option').length).toBe(dropdownOptionsLength);
        });

        it('renders the opensearch values as data attributes of the items in the list', function () {
            expect(view.$el.find('li.dropdown-option a').eq(0).attr('data-opensearch-value')).toBe('os1');
            expect(view.$el.find('li.dropdown-option a').eq(1).attr('data-opensearch-value')).toBe('os2');
        });

        it('renders the display values as the text of the items in the list', function () {
            expect(view.$el.find('li.dropdown-option a').eq(0).text()).toBe('display value1');
            expect(view.$el.find('li.dropdown-option a').eq(1).text()).toBe('display value2');
        });


    });

    describe('when an option is selected', function () {
        var chosenOption;

        beforeEach(function () {
            chosenOption = options.eq(0);
            view.onChangeSelection({ currentTarget: chosenOption });
        });

        it('updates the model', function () {
            expect(view.updateParamsModel).toHaveBeenCalledWith('os1');
        });

        it('triggers a new search', function () {
            expect(mediator.trigger).toHaveBeenCalledWith('search:refinedSearch');
        });
    });
});
