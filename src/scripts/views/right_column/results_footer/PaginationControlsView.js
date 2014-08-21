define(['vendor/requirejs/text!templates/right_column/pagination_controls.html',
       'lib/mediator_mixin'],
       function (paginationControlsTemplate,
                 mediatorMixin) {
  var PaginationControlsView;

  PaginationControlsView = Backbone.View.extend({

    tagName: 'div',
    className: 'pagination',
    template: _.template(paginationControlsTemplate),

    events: {
      'click a': 'onClickAnyPageControl',
      'click .next': 'onClickNextPageButton',
      'click .prev': 'onClickPrevPageButton',
      'click .page_selector': 'onClickPageSelector'
    },

    initialize: function (options) {
      this.options = options;
      this.bindEvents();
    },

    bindEvents: function () {
      this.mediatorBind('search:complete', this.onSearchComplete, this);
      this.mediatorBind('search:initiated', this.hideControls, this);
      this.mediatorBind('search:displayPreviousResults', this.showControls, this);
      this.mediatorBind('app:home', this.hideControls, this);
    },

    render: function () {
      var currentPage = parseInt(this.collection.getPageNumber()),
          ellipsisMin,
          firstMiddlePage,
          firstPage = 1,
          lastMiddlePage,
          lastPage = this.collection.getLastPageNumber(),
          offset,
          secondPage = firstPage + 1,
          secondLastPage =  lastPage - 1,
          showNextEllipsis,
          showPreviousEllipsis;

      // from the current page, how many pages before and after will have direct
      // links
      offset = 1;

      // only use an ellipsis if at least this many options will be hidden
      ellipsisMin = 2;

      // the first and last pages can't be part of the "middle"
      firstMiddlePage = Math.max(currentPage - offset, secondPage);
      lastMiddlePage = Math.min(currentPage + offset, secondLastPage);

      showPreviousEllipsis = Math.abs(firstMiddlePage - firstPage) - 1 >= ellipsisMin;
      showNextEllipsis = Math.abs(lastMiddlePage - lastPage) - 1 >= ellipsisMin;

      // if an ellipsis is not used, all pages from that end to the middle must
      // be visible
      firstMiddlePage = showPreviousEllipsis ? firstMiddlePage : secondPage;
      lastMiddlePage = showNextEllipsis ? lastMiddlePage : secondLastPage;

      this.$el.html(this.template({
        showPreviousEllipsis: showPreviousEllipsis,
        showNextEllipsis: showNextEllipsis,
        firstMiddlePage: firstMiddlePage,
        lastMiddlePage: lastMiddlePage,
        lastPage: lastPage,
        currentPage: currentPage
      }));

      this.$('[title="Go to page ' + currentPage + '"]').addClass('current-page');

      return this;
    },

    onClickAnyPageControl: function () {
      window.scrollTo(0, 0);
    },

    onClickPageSelector: function (ev) {
      this.newSearchWithPageNumber(parseInt(ev.target.text));
    },

    onClickPrevPageButton: function () {
      this.newSearchWithPageNumber(this.collection.getPageNumber() - 1);
    },

    onClickNextPageButton: function () {
      this.newSearchWithPageNumber(this.collection.getPageNumber() + 1);
    },

    newSearchWithPageNumber: function (pageNumber) {
      var currentPage = this.collection.getPageNumber(),
          lastPage = this.collection.getLastPageNumber();

      if (pageNumber > 0 && pageNumber <= lastPage && pageNumber !== currentPage) {
        this.model.setPageNumber(pageNumber);
        this.mediatorTrigger('search:refinedSearch', this.model);
      }
    },

    onSearchComplete: function () {
      var lastPage = this.collection.getLastPageNumber(),
          totalResults = this.collection.getTotalResultsCount();

      this.render();
      if (totalResults > 0 && lastPage > 1) {
        this.showControls();
      } else {
        this.hideControls();
      }
    },

    hideControls: function () {
      this.$el.addClass('hidden');
    },

    showControls: function () {
      this.$el.removeClass('hidden');
    }

  });

  // Mix in the mediator behaviour
  _.extend(PaginationControlsView.prototype, mediatorMixin);

  return PaginationControlsView;
});
