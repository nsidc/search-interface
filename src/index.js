/* jshint esversion: 6 */

import './styles/nsidc_main.scss';
import * as Backbone from 'backbone';
import $ from 'jquery';
import SearchApp from './SearchApp';

function webapp() {
    new SearchApp({
        el: $('#main-content')
    });
    Backbone.history.start();
}

webapp();
