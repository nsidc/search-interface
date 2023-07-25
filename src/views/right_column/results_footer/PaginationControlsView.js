import * as Backbone from 'backbone';
import _ from 'underscore';
import viewTemplate from '../../../templates/right_column/pagination_controls.html';

class PaginationControlsView extends Backbone.View {

    get tagName(){
        return 'div';
    }

    get className() {
        return 'pagination';
    }

    get template() {
        return _.template(viewTemplate);
    }

    get events() {
        return {
            'click a': 'onClickAnyPageControl',
            'click .next': 'onClickNextPageButton',
            'click .prev': 'onClickPrevPageButton',
            'click .page_selector': 'onClickPageSelector'
        };
    }

    initialize(options) {
        this.options = options;
        this.mediator = options.mediator;
        this.bindEvents(this.mediator);
    }

    bindEvents(mediator) {
        mediator.on('search:complete', this.onSearchComplete, this);
        mediator.on('search:initiated', this.hideControls, this);
        mediator.on('search:displayPreviousResults', this.showControls, this);
        mediator.on('app:home', this.hideControls, this);
    }

    render() {
        let currentPage = parseInt(this.collection.getPageNumber()),
            ellipsisMin,
            firstMiddlePage,
            firstPage = 1,
            lastMiddlePage,
            lastPage = this.collection.getLastPageNumber(),
            offset,
            secondPage = firstPage + 1,
            secondLastPage = lastPage - 1,
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
    }

    onClickAnyPageControl() {
        window.scrollTo(0, 0);
    }

    onClickPageSelector(ev) {
        this.newSearchWithPageNumber(parseInt(ev.target.text));
    }

    onClickPrevPageButton() {
        this.newSearchWithPageNumber(this.collection.getPageNumber() - 1);
    }

    onClickNextPageButton() {
        this.newSearchWithPageNumber(this.collection.getPageNumber() + 1);
    }

    newSearchWithPageNumber(pageNumber) {
        let currentPage = this.collection.getPageNumber(),
            lastPage = this.collection.getLastPageNumber();

        if(pageNumber > 0 && pageNumber <= lastPage && pageNumber !== currentPage) {
            this.model.setPageNumber(pageNumber);
            this.mediator.trigger('search:refinedSearch', this.model);
        }
    }

    onSearchComplete() {
        let lastPage = this.collection.getLastPageNumber(),
            totalResults = this.collection.getTotalResultsCount();

        this.render();
        if(totalResults > 0 && lastPage > 1) {
            this.showControls();
        }
        else {
            this.hideControls();
        }
    }

    hideControls() {
        this.$el.addClass('hidden');
    }

    showControls() {
        this.$el.removeClass('hidden');
    }

}

export default PaginationControlsView;
