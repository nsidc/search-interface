define(
  [ 'vendor/requirejs/text!templates/result_item/nsidc_supporting_programs.html'],
  function (supportingProgramsTemplate) {

    var template, SupportingProgramsView;

    template = _.template(supportingProgramsTemplate);

    SupportingProgramsView = Backbone.View.extend({

      render : function () {
        // This is very similar to the catalog page logic, see Catomatic.pm line 749
        var supportingPrograms = _.uniq(_.map(this.model.get('supportingPrograms'), function (program) {

          var supportingProgram = '', programs;

          programs = {
            'NOAA': [/^NOAA/],
            'WDC': [/^WDC/],
            'AGDC': [/^AGDC/],
            'FGDC': [/^FGDC/],
            'ELOKA': [/^ELOKA/],
            'NASA_DAAC': [/^NASA NSIDC DAAC/],
            'ACADIS': [/^ACADIS/],

            'USADCC': [/^USADCC/, /^NSIDC_ARCSS/],
            'NSIDC_ARC': [/^NSIDC_ROCS/, /^NSIDC ARC/]
          };

          _.each(programs, function (progRegex, prog) {
            _.each(progRegex, function (regex) {
              if (program.match(regex)) {
                supportingProgram = prog;
              }
            });
          });

          return supportingProgram;
        }));

        supportingPrograms = _.reject(supportingPrograms, function (program) { return program === ''; });
        this.$el.html(template({supportingPrograms: supportingPrograms}));

        return this;
      }
    });

    return SupportingProgramsView;
  }
);
