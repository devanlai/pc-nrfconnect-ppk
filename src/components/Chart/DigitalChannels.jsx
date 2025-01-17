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
import { colors } from 'pc-nrfconnect-shared';
import { arrayOf, bool, exact, number, shape } from 'prop-types';

import crossHairPlugin from './plugins/chart.crossHair';

import { rightMarginPx } from './chart.scss';

const rightMargin = parseInt(rightMarginPx, 10);
const dataColor = colors.nordicBlue;

const DigitalChannels = ({
    lineData,
    digitalChannels,
    zoomedOutTooFar,
    cursorData: { begin, end, cursorBegin, cursorEnd },
}) => {
    const bitsChartOptions = {
        scales: {
            xAxes: [
                {
                    id: 'xScale',
                    display: false,
                    type: 'linear',
                    ticks: {
                        min: begin,
                        max: end,
                    },
                    tickMarkLength: 0,
                    drawTicks: false,
                    cursor: {
                        cursorBegin,
                        cursorEnd,
                    },
                },
            ],
            yAxes: [
                {
                    type: 'linear',
                    display: false,
                    ticks: {
                        min: -0.5,
                        max: 0.5,
                    },
                },
            ],
        },
        maintainAspectRatio: false,
        animation: { duration: 0 },
        hover: { animationDuration: 0 },
        responsiveAnimationDuration: 0,
        legend: { display: false },
    };

    const commonLineData = {
        backgroundColor: dataColor,
        borderColor: dataColor,
        borderWidth: 1.5,
        pointRadius: 0,
        pointHoverRadius: 0,
        pointHitRadius: 0,
        pointBorderWidth: 0,
        lineTension: 0,
        steppedLine: 'before',
    };

    const bitsChartData = lineData
        .map((singleBitLineData, i) => ({
            datasets: [
                {
                    ...commonLineData,
                    fill: false,
                    data: singleBitLineData.mainLine,
                    label: String(i),
                },
                {
                    ...commonLineData,
                    fill: '-1',
                    data: singleBitLineData.uncertaintyLine,
                    label: `uncertainty ${i}`, // This label is not displayed, just needed as an internal key
                },
            ],
        }))
        .filter((_, i) => digitalChannels[i]);
    return (
        <div className="chart-bits-container">
            {bitsChartData.map((_, i) => (
                <div key={`${i + 1}`} className="chart-bits">
                    <span>{bitsChartData[i].datasets[0].label}</span>
                    <div
                        className="chart-container"
                        style={{ paddingRight: `${rightMargin}px` }}
                    >
                        <Line
                            data={bitsChartData[i]}
                            options={bitsChartOptions}
                            plugins={[crossHairPlugin]}
                        />
                    </div>
                </div>
            ))}
            {zoomedOutTooFar && (
                <div className="info">
                    <p>Zoom in on the main chart to see the digital channels</p>
                </div>
            )}
        </div>
    );
};

const lineData = arrayOf(
    shape({
        x: number.isRequired,
        y: number,
    }).isRequired
).isRequired;

DigitalChannels.propTypes = {
    lineData: arrayOf(
        exact({ mainLine: lineData, uncertaintyLine: lineData }).isRequired
    ).isRequired,
    digitalChannels: arrayOf(bool).isRequired,
    zoomedOutTooFar: bool.isRequired,
    cursorData: shape({
        cursorBegin: number,
        cursorEnd: number,
        begin: number,
        end: number,
    }).isRequired,
};

export default DigitalChannels;
