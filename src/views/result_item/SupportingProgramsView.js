import * as Backbone from 'backbone';
import _ from 'underscore';
import viewTemplate from '../../templates/result_item/supporting_programs.html';

class SupportingProgramsView extends Backbone.View {
    render() {
        let supportingPrograms = _.uniq(_.map(this.model.get('supportingPrograms'), function (program) {

            let supportingProgram = '', programs;

            programs = {
                'NOAA': [/^NOAA/],
                'WDC': [/^WDC/],
                'AGDC': [/^AGDC/],
                'FGDC': [/^FGDC/],
                'ELOKA': [/^ELOKA/],
                'NASA_DAAC': [/^NASA NSIDC DAAC/],
                'ADC': [/^ADC/],

                'USADCC': [/^USADCC/, /^NSIDC_ARCSS/],
                'NSIDC_ARC': [/^NSIDC_ROCS/, /^NSIDC ARC/]
            };

            _.each(programs, function (progRegex, prog) {
                _.each(progRegex, function (regex) {
                    if(program.match(regex)) {
                        supportingProgram = prog;
                    }
                });
            });

            return supportingProgram;
        }));

        supportingPrograms = _.reject(supportingPrograms, function (program) {
            return program === '';
        });
        this.$el.html(_.template(viewTemplate)({supportingPrograms: supportingPrograms}));

        return this;
    }
}

export default SupportingProgramsView;
