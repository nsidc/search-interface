/* jshint esversion: 6 */

import './styles/nsidc_main.scss';
import * as Backbone from 'backbone';
import SearchApp from './SearchApp';

function webapp() {
    const appOptions = {
        el: $('#main-content')
    };
    new SearchApp(appOptions);
    Backbone.history.start();
}

webapp();
