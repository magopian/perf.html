/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { connect } from 'react-redux';
import actions from '../../actions';
import { getRangeFilterLabels } from '../../reducers/url-state';
import FilterNavigatorBar from '../calltree/FilterNavigatorBar';

export default connect(state => {
  const items = getRangeFilterLabels(state);
  return {
    className: 'profileFilterNavigator',
    items: items,
    selectedItem: items.length - 1,
  };
}, {
  onPop: actions.popRangeFiltersAndUnsetSelection,
})(FilterNavigatorBar);
