define(
  [
    'text!templates/left_column/clear-facet-link.html',
    'lib/mediator_mixin'
  ],
  function (link_template, mediatorMixin) {
    var template, ClearFacetLinkView;

    ClearFacetLinkView = Backbone.View.extend({

      initialize: function () {
        this.facet = this.$el.find('ul').attr('id');
        this.element = this.$el;
        template = _.template(link_template)({id: this.facet + '_clear_button'});
        this.mediatorBind('facet:clearLinkTrigger', this.toggle, this);
      },

      events: {
        'click .facet_clear_link': 'clearFacet',
        'keyup .facet-filter': 'onTypedInput'
      },

      clearFacet: function () {
        _.each(this.$el.find(':input[type=checkbox]'), function (input) {
          $(input).attr('checked', false);
        });
        this.mediatorTrigger('model:clearFacet', this.facet);
        this.mediatorTrigger('model:clearSelectedFacet', this.facet);
        this.mediatorTrigger('facet:sort');
        this.toggle();
      },

      render : function () {
        this.$('h3').append(template);
        this.toggle();
        return this;
      },

      toggle : function () {
        var el = $(this.element).find('.facet_clear_link');

        if (this.model.selected()) {
          el.show();
        } else {
          el.hide();
        }
      },

      onTypedInput: function (ev) {
        var el = $(this.element).find('.facet_clear_link');

        if ($(ev.target).val() !== '') {
          el.show();
        } else {
          this.toggle();
        }
      }

    });

    _.extend(ClearFacetLinkView.prototype, mediatorMixin);
    return ClearFacetLinkView;
  });
