define(['lib/mediator_mixin',
 'text!templates/left_column/facet.html',
 'lib/objectFactory'],
 function (mediatorMixin,
   facetTemplate,
   objectFactory) {

  var FacetsView, templates;

  templates = {
    facet: _.template(facetTemplate)
  };

  FacetsView = Backbone.View.extend({

    events: {
      'click .facetExpand':   'expand',
      'click .facetCollapse': 'collapse'
    },

    initialize : function (options) {
      this.options = options;
    },

    collapse: function (event) {
      var id = event.target.id,
      shownFacets = this.options.itemsPerFacet - 1;

      this.$('ul#' + id).children(':gt(' + shownFacets + ')').addClass('hidden');
      this.$('a#' + id + '.facetExpand').removeClass('hidden');
      this.$('a#' + id + '.facetCollapse').addClass('hidden');

      scrollTo(0, ($('#' + id).offset().top) - 50);
    },

    expand: function (event) {
      var id = event.target.id;
      this.$('ul#' + id).children().removeClass('hidden');
      this.$('a#' + id + '.facetExpand').addClass('hidden');
      this.$('a#' + id + '.facetCollapse').removeClass('hidden');
    },

    render: function () {
      this.options.facetsCollection.each(function (facet, index) {
        this.$el.append(templates.facet({id: facet.id}));

        if (this.options.searchParamsModel.get('facetFilters')) {
          var facetFilters = this.options.searchParamsModel.get('facetFilters')[facet.id] || [];

          objectFactory.createInstance('FacetView', {
            el: this.$('.facet').eq(index),
            model: facet,
            selectedFacets: facetFilters
          }).render();
        }
      }, this);

      return this;
    }

  });

  // Mix in the mediator behaviour
  _.extend(FacetsView.prototype, mediatorMixin);

  return FacetsView;
});
