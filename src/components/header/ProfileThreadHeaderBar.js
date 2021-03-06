/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// @flow

import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import ThreadStackGraph from './ThreadStackGraph';
import { selectorsForThread } from '../../reducers/profile-view';
import { getSelectedThreadIndex } from '../../reducers/url-state';
import { getSampleIndexClosestToTime, getStackAsFuncArray } from '../../profile-logic/profile-data';
import actions from '../../actions';
import ContextMenuTrigger from '../shared/ContextMenuTrigger';

import type { IndexIntoFuncTable, Thread, ThreadIndex } from '../../types/profile';
import type { Milliseconds } from '../../types/units';
import type { FuncStackInfo, IndexIntoFuncStackTable } from '../../types/profile-derived';
import type { State } from '../../types/reducers';

type Props = {
  threadIndex: ThreadIndex,
  thread: Thread,
  funcStackInfo: FuncStackInfo,
  interval: Milliseconds,
  rangeStart: Milliseconds,
  rangeEnd: Milliseconds,
  selectedFuncStack: IndexIntoFuncStackTable,
  isSelected: boolean,
  isHidden: boolean,
  style: Object,
  threadName: string,
  processDetails: string,
  changeSelectedThread: ThreadIndex => void,
  changeSelectedFuncStack: (IndexIntoFuncStackTable, IndexIntoFuncTable[]) => void,
};

class ProfileThreadHeaderBar extends PureComponent {
  props: Props;

  constructor(props) {
    super(props);
    (this: any)._onLabelMouseDown = this._onLabelMouseDown.bind(this);
    (this: any)._onGraphClick = this._onGraphClick.bind(this);
    (this: any)._onMarkerSelect = this._onMarkerSelect.bind(this);
  }

  _onLabelMouseDown(event: MouseEvent) {
    if (event.button === 0) {
      const { changeSelectedThread, threadIndex } = this.props;
      changeSelectedThread(threadIndex);

      // Don't allow clicks on the threads list to steal focus from the tree view.
      event.preventDefault();
    }
  }

  _onGraphClick(time: number) {
    const { threadIndex, changeSelectedThread } = this.props;
    changeSelectedThread(threadIndex);
    if (time !== undefined) {
      const { thread, funcStackInfo, changeSelectedFuncStack } = this.props;
      const sampleIndex = getSampleIndexClosestToTime(thread.samples, time);
      const newSelectedStack = thread.samples.stack[sampleIndex];
      const newSelectedFuncStack = newSelectedStack === null ? -1 : funcStackInfo.stackIndexToFuncStackIndex[newSelectedStack];
      changeSelectedFuncStack(threadIndex,
        getStackAsFuncArray(newSelectedFuncStack, funcStackInfo.funcStackTable));
    }
  }

  _onMarkerSelect(/* markerIndex */) {
  }

  render() {
    const {
      thread, interval, rangeStart, rangeEnd, funcStackInfo, selectedFuncStack,
      isSelected, style, threadName, processDetails, isHidden,
    } = this.props;
    if (isHidden) {
      // If this thread is hidden, render out a stub element so that the Reorderable
      // Component still works across all the threads.
      return <li className='profileThreadHeaderBarHidden' />;
    }
    return (
      <li className={'profileThreadHeaderBar' + (isSelected ? ' selected' : '')} style={style}>
        <ContextMenuTrigger id={'ProfileThreadHeaderContextMenu'}
                            renderTag='h1'
                            attributes={{
                              title: processDetails,
                              className: 'grippy',
                              onMouseDown: this._onLabelMouseDown,
                            }}>
          {threadName}
        </ContextMenuTrigger>
        <ThreadStackGraph interval={interval}
                          thread={thread}
                          className='threadStackGraph'
                          rangeStart={rangeStart}
                          rangeEnd={rangeEnd}
                          funcStackInfo={funcStackInfo}
                          selectedFuncStack={selectedFuncStack}
                          onClick={this._onGraphClick}
                          onMarkerSelect={this._onMarkerSelect}/>
      </li>
    );
  }

}

export default connect((state: State, props) => {
  const threadIndex: ThreadIndex = props.index;
  const selectors = selectorsForThread(threadIndex);
  const selectedThread = getSelectedThreadIndex(state);
  return {
    thread: selectors.getFilteredThread(state),
    threadName: selectors.getFriendlyThreadName(state),
    processDetails: selectors.getThreadProcessDetails(state),
    funcStackInfo: selectors.getFuncStackInfo(state),
    selectedFuncStack: threadIndex === selectedThread ? selectors.getSelectedFuncStack(state) : -1,
    isSelected: threadIndex === selectedThread,
    threadIndex,
  };
}, actions)(ProfileThreadHeaderBar);
