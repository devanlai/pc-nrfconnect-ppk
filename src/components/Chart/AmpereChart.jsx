/* Copyright (c) 2015 - 2020, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Use in source and binary forms, redistribution in binary form only, with
 * or without modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions in binary form, except as embedded into a Nordic
 *    Semiconductor ASA integrated circuit in a product or a software update for
 *    such product, must reproduce the above copyright notice, this list of
 *    conditions and the following disclaimer in the documentation and/or other
 *    materials provided with the distribution.
 *
 * 2. Neither the name of Nordic Semiconductor ASA nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
 * 3. This software, with or without modification, must only be used with a Nordic
 *    Semiconductor ASA integrated circuit.
 *
 * 4. Any software provided in binary form under this license must not be reverse
 *    engineered, decompiled, modified and/or disassembled.
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import React from 'react';
import { Line } from 'react-chartjs-2';
import { useDispatch, useSelector } from 'react-redux';
import { unit } from 'mathjs';
import { colors } from 'pc-nrfconnect-shared';
import { arrayOf, func, number, shape } from 'prop-types';

import { updateTriggerLevel as updateTriggerLevelAction } from '../../actions/triggerActions';
import { indexToTimestamp } from '../../globals';
import { appState } from '../../reducers/appReducer';
import { chartState } from '../../reducers/chartReducer';
import {
    triggerLevelSetAction,
    triggerState,
} from '../../reducers/triggerReducer';
import { isRealTimePane as isRealTimePaneSelector } from '../../utils/panes';
import crossHairPlugin from './plugins/chart.crossHair';
import dragSelectPlugin from './plugins/chart.dragSelect';
import triggerLevelPlugin from './plugins/chart.triggerLevel';
import triggerOriginPlugin from './plugins/chart.triggerOrigin';
import zoomPanPlugin from './plugins/chart.zoomPan';

import { rightMarginPx, yAxisWidthPx } from './chart.scss';

const valueRange = { min: 0, max: undefined };
const yAxisWidth = parseInt(yAxisWidthPx, 10);
const rightMargin = parseInt(rightMarginPx, 10);
const dataColor = colors.nordicBlue;

const formatCurrent = uA =>
    unit(uA, 'uA')
        .format({ notation: 'auto', precision: 4 })
        .replace('u', '\u00B5');

const AmpereChart = ({
    setLen,
    setChartAreaWidth,
    step,
    chartRef,
    cursorData: { begin, end },
    lineData,
}) => {
    const dispatch = useDispatch();
    const {
        triggerLevel,
        triggerRunning,
        triggerSingleWaiting,
        externalTrigger,
        triggerOrigin,
    } = useSelector(triggerState);
    const {
        windowBegin,
        windowEnd,
        windowDuration,
        cursorBegin,
        cursorEnd,
        yMin,
        yMax,
        timestampsVisible,
    } = useSelector(chartState);
    const { samplingRunning } = useSelector(appState);
    const isRealTimePane = useSelector(isRealTimePaneSelector);
    const sendTriggerLevel = level => dispatch(updateTriggerLevelAction(level));
    const updateTriggerLevel = level => dispatch(triggerLevelSetAction(level));

    const timestampToLabel = React.useCallback(
        (_usecs, index, array) => {
            let usecs = _usecs;
            if (triggerOrigin != null) {
                usecs -= indexToTimestamp(triggerOrigin);
            }
            const microseconds = Math.abs(usecs);
            const sign = usecs < 0 ? '-' : '';
            if (!array) {
                return `${sign}${Number(microseconds / 1e3).toFixed(3)} ms`;
            }
            if (index > 0 && index < array.length - 1) {
                const first = array[0] - indexToTimestamp(triggerOrigin);
                const last =
                    array[array.length - 1] - indexToTimestamp(triggerOrigin);
                const range = last - first;
                if (usecs - first < range / 8 || last - usecs < range / 8) {
                    return undefined;
                }
            }
            const d = new Date(microseconds / 1e3);
            const h = d.getUTCHours().toString().padStart(2, '0');
            const m = d.getUTCMinutes().toString().padStart(2, '0');
            const s = d.getUTCSeconds().toString().padStart(2, '0');

            const time = `${sign}${h}:${m}:${s}`;
            const subsecond = `${Number((microseconds / 1e3) % 1e3).toFixed(
                3
            )}`.padStart(7, '0');

            return [time, subsecond];
        },
        [triggerOrigin]
    );

    const live =
        windowBegin === 0 &&
        windowEnd === 0 &&
        (samplingRunning || triggerRunning || triggerSingleWaiting);
    const snapping = step <= 0.16 && !live;

    const pointRadius = step <= 0.08 ? 4 : 2;
    const chartData = {
        datasets: [
            {
                borderColor: dataColor,
                borderWidth: step > 2 ? 1 : 1.5,
                fill: false,
                data: lineData,
                pointRadius: snapping ? pointRadius : 0,
                pointHoverRadius: snapping ? pointRadius : 0,
                pointHitRadius: snapping ? pointRadius : 0,
                pointBackgroundColor: colors.white,
                pointHoverBackgroundColor: dataColor,
                pointBorderWidth: 1.5,
                pointHoverBorderWidth: 1.5,
                pointBorderColor: dataColor,
                pointHoverBorderColor: dataColor,
                lineTension: snapping ? 0.2 : 0,
                label: 'Current',
                yAxisID: 'yScale',
                labelCallback: ({ y }) => formatCurrent(y),
            },
        ],
    };

    const chartOptions = {
        scales: {
            xAxes: [
                {
                    id: 'xScale',
                    type: 'linear',
                    display: true,
                    ticks: {
                        display: timestampsVisible,
                        minRotation: 0,
                        maxRotation: 0,
                        autoSkipPadding: 25,
                        min: begin,
                        max: end,
                        callback: timestampToLabel,
                        maxTicksLimit: 7,
                    },
                    gridLines: {
                        drawBorder: true,
                        drawOnChartArea: true,
                    },
                    cursor: { cursorBegin, cursorEnd },
                afterFit: scale => { scale.paddingRight = rightMargin; }, // eslint-disable-line
                },
            ],
            yAxes: [
                {
                    id: 'yScale',
                    type: 'linear',
                    ticks: {
                        minRotation: 0,
                        maxRotation: 0,
                        min: yMin === null ? valueRange.min : yMin,
                        max: yMax === null ? valueRange.max : yMax,
                        maxTicksLimit: 7,
                        padding: 0,
                        callback: uA => (uA < 0 ? '' : formatCurrent(uA)),
                    },
                    gridLines: {
                        drawBorder: true,
                        drawOnChartArea: true,
                    },
                    afterFit: scale => { scale.width = yAxisWidth; }, // eslint-disable-line
                },
            ],
        },
        maintainAspectRatio: false,
        animation: { duration: 0 },
        hover: { animationDuration: 0 },
        responsiveAnimationDuration: 0,
        tooltips: { enabled: false },
        legend: { display: false },
        formatX: timestampToLabel,
        formatY: formatCurrent,
        triggerLevel,
        triggerActive: triggerRunning || triggerSingleWaiting,
        sendTriggerLevel,
        updateTriggerLevel,
        snapping,
        live,
        triggerHandleVisible: isRealTimePane && !externalTrigger,
        triggerOrigin,
        windowDuration,
    };

    const plugins = [
        dragSelectPlugin,
        zoomPanPlugin,
        triggerLevelPlugin,
        triggerOriginPlugin,
        crossHairPlugin,
        {
            id: 'notifier',
            afterLayout(chart) {
                const { chartArea, width } = chart;
                chartArea.right = width - rightMargin;
                const { left, right } = chart.chartArea;
                const w = Math.trunc(right - left);
                setLen(Math.min(w, 2000));
                setChartAreaWidth(w);
            },
        },
    ];

    return (
        <div className="chart-container">
            <Line
                ref={chartRef}
                data={chartData}
                options={chartOptions}
                plugins={plugins}
            />
        </div>
    );
};

AmpereChart.propTypes = {
    setLen: func.isRequired,
    setChartAreaWidth: func.isRequired,
    step: number.isRequired,
    chartRef: shape({}).isRequired,
    cursorData: shape({
        begin: number.isRequired,
        end: number.isRequired,
    }).isRequired,
    lineData: arrayOf(
        shape({
            x: number,
            y: number,
        })
    ),
};

export default AmpereChart;
