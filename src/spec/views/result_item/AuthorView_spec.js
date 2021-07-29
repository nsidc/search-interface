import AuthorView from '../../views/result_item/AuthorView';

describe('Author View', function () {

  // alias for the namespaced constructor
  var authorView,
      fakeSearchResultsModel,
      element;

  beforeEach(function () {
    element = document.createElement('div');
  });

  it('displays a label and the author name', function () {
    fakeSearchResultsModel = new Backbone.Model({author: ['Alice Bob']});

    authorView = new AuthorView({el: element, model: fakeSearchResultsModel});

    // act
    authorView.render();

    // assert
    expect($(element).find('.label').length).toEqual(1);
    expect($(element).find('.author-name').text()).toEqual('Alice Bob');
  });

  it('separates multiple author names with commas', function () {
    fakeSearchResultsModel = new Backbone.Model({author: ['Alice Bob', 'Dave, Carol']});

    authorView = new AuthorView({el: element, model: fakeSearchResultsModel});

    // act
    authorView.render();

    // assert
    expect($(element).find('.label').length).toEqual(1);
    expect($(element).find('.author-name').text()).toEqual('Alice Bob, Dave, Carol');
  });

  it('doesn\'t display any author fields if there is no author', function () {
    fakeSearchResultsModel = new Backbone.Model();
    authorView = new AuthorView({el: element, model: fakeSearchResultsModel});

    authorView.render();

    expect($(element).find('.label').length).toEqual(0);
  });

});
